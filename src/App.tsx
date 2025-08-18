import { useState } from "react";
import "./App.css";
import { useAuthenticator } from '@aws-amplify/ui-react';

function App() {
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
    <main>
      <header>
        <div style={{ width: '130px', height: '120px', overflow: 'hidden', borderRadius: '8px', marginLeft: '20px' }}>
          <img
            style={{ width: '100%', height: '100%', objectFit: 'contain', boxSizing: 'border-box' }}
            src="https://www.bharatbiotech.com/images/bharat-biotech-logo.jpg"
            alt="Company Logo"
          />
        </div>
        <button style={{ marginLeft: 'auto', marginRight: '20px' }} onClick={signOut}>
          Sign out
        </button>
      </header>

      <h1 style={{ padding: "10px", textAlign: "center", width: "100vw" }}>
        <u>HR- Dashboard Update Interface</u>
      </h1>

      {/* File Upload */}
      <div>
        <p
          style={{
            padding: "10px",
            backgroundColor: "#e6e6e6",
            borderRadius: "8px",
            width: "50vw",
            height: "70px",
          }}
        >
          &emsp;&emsp;&emsp;&emsp;
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
        </p>
        {responseMessage && (
          <p style={{ padding: "10px", color: responseMessage.includes("success") ? "green" : "red" }}>
            {responseMessage}
          </p>
        )}
      </div>
    </main>
  );
}

export default App;
