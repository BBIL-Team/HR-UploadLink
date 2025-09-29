import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from '@aws-amplify/auth';

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.csv', '.pdf', '.xlsx', '.xls', '.doc', '.docx'];

const App: React.FC = () => {
  const { signOut } = useAuthenticator();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [userAttributes, setUserAttributes] = useState<{ username?: string }>({ username: '' });

  // Fetch user attributes on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const attributes = await fetchUserAttributes();
        const username = attributes.preferred_username || attributes.email || '';
        setUserAttributes({ username });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserAttributes({ username: '' });
      }
    };
    fetchUserData();
  }, []);

  // Manage body scroll when modal is open
  useEffect(() => {
    if (showMessageModal || isUploading) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [showMessageModal, isUploading]);

  // Validate file extension
  const validateFile = (file: File | null): boolean => {
    if (file) {
      const extension = (file.name.split('.').pop() || '').toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(`.${extension}`)) {
        return true;
      }
    }
    setModalMessage(`Please upload a valid file (.csv, .pdf, .xlsx, .xls, .doc, .docx).`);
    setModalType('error');
    setShowMessageModal(true);
    return false;
  };

  // Handle file upload
  const uploadFile = async (file: File | null, uploadUrl: string) => {
    if (!file) {
      setModalMessage(`Please select a file to upload.`);
      setModalType('error');
      setShowMessageModal(true);
      return;
    }

    const originalFileName = file.name;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', originalFileName);
    formData.append('username', userAttributes.username || 'Unknown');
    formData.append('fileType', 'stocks');

    try {
      setIsUploading(true);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        setModalMessage(uploadData.message || `File uploaded successfully!`);
        setModalType('success');
        setShowMessageModal(true);
        setFile(null);
      } else {
        const errorData = await uploadResponse.json();
        setModalMessage(errorData.message || errorData.error || `Failed to upload file: ${uploadResponse.statusText}`);
        setModalType('error');
        setShowMessageModal(true);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setModalMessage(`An error occurred while uploading the file: ${error.message || 'Unknown error'}`);
      setModalType('error');
      setShowMessageModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '90vw', backgroundColor: 'teal' }}>
      <header style={{ width: '100%' }}>
        <div style={{ width: '130px', height: '90px', overflow: 'hidden', borderRadius: '8px' }}>
          <img
            style={{ padding: '10px', width: '100%', height: '100%', objectFit: 'contain' }}
            src="https://www.bharatbiotech.com/images/bharat-biotech-logo.jpg"
            alt="Company Logo"
            className="logo"
          />
        </div>
        <div className="header-user-info">
          <span className="username">Hi, {userAttributes.username || 'User'}</span>
          <button className="sign-out-btn" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <h1 style={{ padding: '10px', textAlign: 'center', width: '100vw' }}>
        <u>BBIL HR - Dashboard Update Interface</u>
      </h1>

      {showMessageModal && (
        <div className="modal-overlay">
          <div className="modal-content message-modal">
            <span className={`modal-icon ${modalType === 'success' ? 'success-icon' : 'error-icon'}`}>
              {modalType === 'success' ? '✅' : '❌'}
            </span>
            <h3 className="modal-title">{modalType === 'success' ? 'Success' : 'Error'}</h3>
            <p className={`message-text ${modalType === 'success' ? 'success-text' : 'error-text'}`}>
              {modalMessage}
            </p>
            <button className="ok-btn" onClick={() => setShowMessageModal(false)}>OK</button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="modal-overlay">
          <div className="modal-content loading-modal">
            <p className="loading-text">Uploading...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      )}

      <div className="file-section" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div className="upload-section" style={{ maxWidth: '45%' }}>
          <h2>📤 Upload Files</h2>
          <div>
            <h2>&emsp;&emsp;Anamay Stocks</h2>
            <p style={{ padding: '10px', backgroundColor: '#e6e6e6', borderRadius: '8px', width: '50vw', height: '70px', float: 'left' }}>
              &emsp;&emsp;&emsp;&emsp;
              <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <button onClick={() => {
                if (validateFile(file)) {
                  uploadFile(file, "https://ty1d56bgkb.execute-api.ap-south-1.amazonaws.com/S1/Anamay_Stocks_UploadLink_Dev");
                }
              }}>
                Submit Stocks File
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
