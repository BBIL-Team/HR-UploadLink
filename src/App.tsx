import React, { useState } from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';

// Define supported file extensions
const SUPPORTED_EXTENSIONS = ['.csv', '.pdf', '.xlsx', '.xls', '.doc', '.docx'];

const App: React.FC = () => {
  const { signOut } = useAuthenticator((context) => [context.signOut]);
  
  // State definitions
  const [file, setFile] = useState<File | null>(null);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalType, setModalType] = useState<'error' | 'success'>('error');
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

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
          uploadedBy: 'Unknown', // Replaced userAttributes.username with static value
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
    </main>
  );
};

export default App;
