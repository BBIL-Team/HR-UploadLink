import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';

// Define supported file extensions
const SUPPORTED_EXTENSIONS = ['.csv', '.pdf', '.xlsx', '.xls', '.doc', '.docx'];

const App: React.FC = () => {
  const { signOut, user } = useAuthenticator((context) => [context.signOut, context.user]);
  
  // State definitions
  const [file, setFile] = useState<File | null>(null);
  const [userAttributes, setUserAttributes] = useState<{ username?: string; phoneNumber?: string }>({
    username: '',
    phoneNumber: '',
  });
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalType, setModalType] = useState<'error' | 'success'>('error');
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');

  // Fetch user attributes using Auth.currentAuthenticatedUser
  useEffect(() => {
    const fetchUserAttributes = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        if (currentUser) {
          const attributes = await Auth.userAttributes(currentUser);
          const username = attributes.find(attr => attr.Name === 'preferred_username')?.Value || currentUser.username || '';
          const phoneNumber = attributes.find(attr => attr.Name === 'phone_number')?.Value || '';
          setUserAttributes({ username, phoneNumber });
        }
      } catch (error) {
        console.error('Error fetching user attributes:', error);
        setModalMessage('Failed to fetch user attributes.');
        setModalType('error');
        setShowMessageModal(true);
      }
    };

    if (user) {
      fetchUserAttributes();
    }
  }, [user]);

  // Validate file extension
  const validateFile = (file: File | null): boolean => {
    if (!file) {
      setModalMessage('Please upload a valid file.');
      setModalType('error');
      setShowMessageModal(true);
      return false;
    }
    const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      setModalMessage('Please upload a valid file (.csv, .pdf, .xlsx, .xls, .doc, .docx).');
      setModalType('error');
      setShowMessageModal(true);
      return false;
    }
    return true;
  };

  // Handle file upload
  const uploadFile = async (file: File | null, apiUrl: string) => {
    if (!file) {
      setModalMessage('Please select a file to upload.');
      setModalType('error');
      setShowMessageModal(true);
      return;
    }

    if (!selectedMonth) {
      setModalMessage('Please select the correct month.');
      setModalType('error');
      setShowMessageModal(true);
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          uploadedBy: userAttributes.username || 'Unknown',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const uploadData = await response.json();
      setModalMessage(uploadData.message || 'File uploaded successfully!');
      setModalType('success');
      setShowMessageModal(true);
    } catch (error) {
      console.error('Error saving to DynamoDB:', error);
      setModalMessage('Failed to upload file. Please try again.');
      setModalType('error');
      setShowMessageModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle username update
  const handleUpdateUsername = async () => {
    if (!newUsername) {
      setModalMessage('Please enter a valid username.');
      setModalType('error');
      setShowMessageModal(true);
      return;
    }

    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(currentUser, {
        'preferred_username': newUsername,
      });
      setUserAttributes((prev) => ({ ...prev, username: newUsername }));
      setModalMessage('Username updated successfully!');
      setModalType('success');
      setShowMessageModal(true);
      setShowUpdateForm(false);
      setNewUsername('');
    } catch (error) {
      console.error('Error updating username:', error);
      setModalMessage('Failed to update username. Please try again.');
      setModalType('error');
      setShowMessageModal(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowMessageModal(false);
    setModalMessage('');
  };

  return (
    <main className="app-main">
      <header className="app-header">
        <div style={{ width: '130px', height: '120px', overflow: 'hidden', borderRadius: '8px', marginLeft: '20px' }}>
          <img
            style={{ width: '100%', height: '100%', objectFit: 'contain', boxSizing: 'border-box' }}
            src="https://www.bharatbiotech.com/images/bharat-biotech-logo.jpg"
            alt="Company Logo"
          />
        </div>
        <div className="user-info-inner">
          <span className="username">
            {userAttributes.username ? (
              `Hi, ${userAttributes.username}`
            ) : (
              <button className="update-username-btn" onClick={() => setShowUpdateForm(true)}>
                Update Username
              </button>
            )}
          </span>
          <span className="phone-number">{userAttributes.phoneNumber || 'Phone: Not set'}</span>
        </div>
        <button className="sign-out-btn" onClick={signOut}>
          Sign out
        </button>
      </header>

      <h1 className="app-title">
        <u>BBIL Production Dashboard Update Interface</u>
      </h1>

      <div className="upload-section">
        <h2>📤 Upload File</h2>
        <div className="upload-form">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-selector"
            disabled={isUploading}
          >
            <option value="">Select Month</option>
            <option value="January">January</option>
            <option value="February">February</option>
            {/* Add other months as needed */}
          </select>
          <input
            type="file"
            accept=".csv,.pdf,.xlsx,.xls,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input"
            disabled={isUploading}
          />
          <button
            className="upload-btn"
            onClick={() => {
              if (validateFile(file)) {
                uploadFile(file, 'https://djtdjzbdtj.execute-api.ap-south-1.amazonaws.com/P1/Production_Uploadlink');
              }
            }}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Submit File'}
          </button>
        </div>
      </div>

      {/* Modal for displaying messages */}
      {showMessageModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{modalType === 'error' ? 'Error' : 'Success'}</h3>
            <p>{modalMessage}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {/* Modal for updating username */}
      {showUpdateForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update Username</h3>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              className="username-input"
            />
            <div>
              <button onClick={handleUpdateUsername}>Save</button>
              <button onClick={() => setShowUpdateForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default App;
