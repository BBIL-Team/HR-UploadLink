import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';

const App: React.FC = () => {
  const { signOut } = useAuthenticator();
  const [file, setFile] = useState<File | null>(null);
  const [userAttributes, setUserAttributes] = useState<{ username?: string; phoneNumber?: string }>({
    username: '',
    phoneNumber: '',
  });
 

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

  const uploadFile = async (file: File | null, apiUrl: string) => {
    if (!file) {
      setModalMessage("Please select a file to upload.");
      setModalType('error');
      setShowMessageModal(true);
      return;
    }
    if (!selectedMonth) {
      setModalMessage("Please select the correct month.");
      setModalType('error');
      setShowMessageModal(true);
      
      return;
        try {
          await fetch('https://djtdjzbdtj.execute-api.ap-south-1.amazonaws.com/P1/save-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: originalFileName,
              uploadedBy: userAttributes.username || 'Unknown',
            }),
          });
        } catch (error) {
          console.error('Error saving to DynamoDB:', error);
          setModalMessage(`${uploadData.message || "File uploaded successfully!"} However, failed to save upload details.`);
          setModalType('error');
          setShowMessageModal(true);
        }
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
          )}
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
      </div>
    </main>
  );
};

export default App;
