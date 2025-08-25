import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from '@aws-amplify/auth';

// Hardcoded bucket and folder names
const BUCKET_NAME = 'production-bbil';
const FOLDER_NAME = 'Production_daily_upload_files_location/';
const SAMPLE_FILE_KEY = 'Production_Sample_Files/Sample_File.csv';

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
    setModalMessage("Please upload a valid file (.csv, .pdf, .xlsx, .xls, .doc, .docx).");
    setModalType('error');
    setShowMessageModal(true);
    return false;
  };

  // Handle file upload
  const uploadFile = async (file: File | null) => {
    if (!file) {
      setModalMessage("Please select a file to upload.");
      setModalType('error');
      setShowMessageModal(true);
      return;
    }

    const originalFileName = file.name;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', originalFileName);
    formData.append('username', userAttributes.username || 'Unknown');

    try {
      setIsUploading(true);
      const uploadResponse = await fetch('https://djtdjzbdtj.execute-api.ap-south-1.amazonaws.com/P1/Production_Uploadlink', {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        setModalMessage(uploadData.message || "File uploaded successfully!");
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
      console.error("Error:", error);
      setModalMessage(`An error occurred while uploading the file: ${error.message || 'Unknown error'}`);
      setModalType('error');
      setShowMessageModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file download
  const downloadFile = async () => {
    try {
      const response = await fetch('https://e3blv3dko6.execute-api.ap-south-1.amazonaws.com/P1/presigned_urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucket_name: BUCKET_NAME,
          file_key: SAMPLE_FILE_KEY,
          action: 'download',
          isSample: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.presigned_url) {
          const link = document.createElement('a');
          link.href = data.presigned_url;
          link.download = SAMPLE_FILE_KEY.split('/').pop() || 'Sample_File.csv';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setModalMessage(`Downloaded ${SAMPLE_FILE_KEY.split('/').pop()} successfully!`);
          setModalType('success');
          setShowMessageModal(true);
        } else {
          setModalMessage('Failed to fetch download link.');
          setModalType('error');
          setShowMessageModal(true);
        }
      } else {
        const errorData = await response.json();
        setModalMessage(`Error: ${errorData.error || 'Failed to fetch download link'} (Status: ${response.status})`);
        setModalType('error');
        setShowMessageModal(true);
      }
    } catch (error: any) {
      console.error('Download error:', error);
      setModalMessage(`An error occurred while fetching the download link: ${error.message}`);
      setModalType('error');
      setShowMessageModal(true);
    }
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
        <div className="header-user-info">
          <span className="username">Hi, {userAttributes.username || 'User'}</span>
          <button className="sign-out-btn" onClick={signOut}>Sign out</button>
        </div>
      </header>

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

      <h1 className="app-title"><u>BBIL File Upload Interface</u></h1>

      <div className="container" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="upload-section" style={{ width: '45%' }}>
          <h2>📤 Upload File</h2>
          <div className="upload-form">
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
                  uploadFile(file);
                }
              }}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Submit File'}
            </button>
          </div>
        </div>

        <div className="download-section" style={{ width: '45%' }}>
          <h2>📥 Download Sample File</h2>
          <div className="download-form">
            <button
              className="download-btn"
              onClick={downloadFile}
              disabled={isUploading}
            >
              Download Sample CSV
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
