import { useEffect, useState } from "react";
import "./App.css";

function App() {
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
    <div style={{ display: "flex", flexDirection: "column" }}>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "90vw",
          backgroundColor: "#f8f8ff",
        }}
      >
        <header style={{ width: "100%", display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "130px",
              height: "90px",
              overflow: "hidden",
              borderRadius: "8px",
            }}
          >
            <img
              style={{
                padding: "10px",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "50% 50%",
              }}
              src="https://www.bharatbiotech.com/images/bharat-biotech-logo.jpg"
              alt="Company Logo"
              className="logo"
            />
          </div>
          <button style={{ marginLeft: "auto", marginRight: "20px" }} onClick={signOut}>
            Sign out
          </button>
        </header>

        <h1 style={{ padding: "10px", textAlign: "center", width: "100vw" }}>
          <u>Anamay - Dashboard Update Interface</u>
        </h1>

        {/* File Upload */}
        <div>
          <h2>&emsp;&emsp;Anamay Stocks</h2>
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
    </div>
  );
}

export default App;
