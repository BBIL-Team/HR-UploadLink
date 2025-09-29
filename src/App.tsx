import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from '@aws-amplify/auth';

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.csv', '.pdf', '.xlsx', '.xls', '.doc', '.docx'];

// File type configuration
const FILE_TYPES = {
  darwinbox: { label: 'Darwinbox Tickets', url: 'https://ty1d56bgkb.execute-api.ap-south-1.amazonaws.com/S1/Darwinbox_Tickets_UploadLink_Dev' },
  attrition: { label: 'Attrition Tracker', url: 'https://ty1d56bgkb.execute-api.ap-south-1.amazonaws.com/S1/Attrition_Tracker_UploadLink_Dev' },
  contract: { label: 'Contract to Hire', url: 'https://ty1d56bgkb.execute-api.ap-south-1.amazonaws.com/S1/Contract_to_Hire_UploadLink_Dev' },
} as const;

type FileType = keyof typeof FILE_TYPES;

const App: React.FC = () => {
  const { signOut } = useAuthenticator();
  const [files, setFiles] = useState<{ [key in FileType]: File | null }>({
    darwinbox: null,
    attrition: null,
    contract: null,
  });
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
  const validateFile = (file: File | null, fileType: FileType): boolean => {
    if (file) {
      const extension = (file.name.split('.').pop() || '').toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(`.${extension}`)) {
        return true;
      }
    }
    setModalMessage(`Please upload a valid file for ${FILE_TYPES[fileType].label} (.csv, .pdf, .xlsx, .xls, .doc, .docx).`);
    setModalType('error');
    setShowMessageModal(true);
    return false;
  };

  // Handle file upload
  const uploadFile = async (file: File | null, fileType: FileType, uploadUrl: string) => {
    if (!file) {
      setModalMessage(`Please select a file to upload for ${FILE_TYPES[fileType].label}.`);
      setModalType('error');
      setShowMessageModal(true);
      return;
    }

    const originalFileName = file.name;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', originalFileName);
    formData.append('username', userAttributes.username || 'Unknown');
    formData.append('fileType', fileType);

    try {
      setIsUploading(true);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        setModalMessage(uploadData.message || `File uploaded successfully for ${FILE_TYPES[fileType].label}!`);
        setModalType('success');
        setShowMessageModal(true);
        setFiles((prev) => ({ ...prev, [fileType]: null }));
      } else {
        const errorData = await uploadResponse.json();
        setModalMessage(errorData.message || errorData.error || `Failed to upload file for ${FILE_TYPES[fileType].label}: ${uploadResponse.statusText}`);
        setModalType('error');
        setShowMessageModal(true);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setModalMessage(`An error occurred while uploading the file for ${FILE_TYPES[fileType].label}: ${error.message || 'Unknown error'}`);
      setModalType('error');
      setShowMessageModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '90vw', backgroundColor: '#f8f8ff' }}>
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

      <div className="file-section" style={{ justifyContent: 'center', gap: '20px' }}>
        <div className="upload-section" style={{ maxWidth: '45%' }}>
          {Object.keys(FILE_TYPES).map((key) => (
            <div key={key}>
              <h2>{FILE_TYPES[key as FileType].label}</h2>
              <p style={{ padding: '10px', backgroundColor: '#e6e6e6', borderRadius: '8px', width: '50vw', height: '70px', float: 'left' }}>
                &emsp;&emsp;&emsp;&emsp;
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }))}
                />
                <button
                  onClick={() => {
                    if (validateFile(files[key as FileType], key as FileType)) {
                      uploadFile(files[key as FileType], key as FileType, FILE_TYPES[key as FileType].url);
                    }
                  }}
                >
                  Submit File
                </button>
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default App;
