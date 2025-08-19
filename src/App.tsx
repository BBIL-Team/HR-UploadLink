import React, { useState} from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';
import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuthenticator } from '@aws-amplify/ui-react';

const App: React.FC = () => {
  const { signOut } = useAuthenticator();
  const [file, setFile] = useState<File | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>("");

  const validateFile = (file: File | null): boolean => {
    if (file && file.name.endsWith(".csv")) {
      return true;
    }
    alert("Please upload a valid CSV file.");
    return false;
  };

  const uploadFile = async (file: File | null, apiUrl: string) => {
    if (!file) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(data.message || "File uploaded successfully!");
      } else {
        const errorText = await response.text();
        setResponseMessage(`Failed to upload file: ${errorText}`);
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      setResponseMessage("An error occurred while uploading the file.");
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
          <button className="sign-out-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <h1 className="app-title">
        <u>BBIL HR Dashboard Update Interface</u>
      </h1>

      <div className="upload-section">
        <h2>📤 Upload File</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={() => {
            if (validateFile(file)) {
              uploadFile(
                file,
                "https://ty1d56bgkb.execute-api.ap-south-1.amazonaws.com/S1/Anamay_Stocks_UploadLink_Dev"
              );
            }
          }}
        >
          Submit File
        </button>
        {responseMessage && (
          <p style={{ padding: "10px", color: responseMessage.includes("success") ? "green" : "red" }}>
            {responseMessage}
          </p>
        )}
      </div>
    </main>
  );
};

export default App;
const App: React.FC = () => {
  const { signOut } = useAuthenticator();
  const [file, setFile] = useState<File | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>("");

  const validateFile = (file: File | null): boolean => {
    if (file && file.name.endsWith(".csv")) {
      return true;
    }
    alert("Please upload a valid CSV file.");
    return false;
  };

  const uploadFile = async (file: File | null, apiUrl: string) => {
    if (!file) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(data.message || "File uploaded successfully!");
      } else {
        const errorText = await response.text();
        setResponseMessage(`Failed to upload file: ${errorText}`);
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      setResponseMessage("An error occurred while uploading the file.");
    }
  };

  return (
    <div> {/* Added a single parent div */}
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

      <main className="app-main">
        <h1 className="app-title">
          <u>BBIL HR Dashboard Update Interface</u>
        </h1>

        <div className="upload-section">
          <h2>📤 Upload File</h2>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => {
              if (validateFile(file)) {
                uploadFile(
                  file,
                  "https://ty1d56bgkb.execute-api.ap-south-1.amazonaws.com/S1/Anamay_Stocks_UploadLink_Dev"
                );
              }
            }}
          >
            Submit File
          </button>
          {responseMessage && (
            <p style={{ padding: "10px", color: responseMessage.includes("success") ? "green" : "red" }}>
              {responseMessage}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
