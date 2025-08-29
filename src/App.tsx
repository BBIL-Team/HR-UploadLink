import React, { useState } from 'react';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Simulate file upload logic
      alert(`Uploading file: ${selectedFile.name}`);
    } else {
      alert('Please select a file to upload');
    }
  };

  const handleDownload = () => {
    // Simulate file download logic
    const dummyFileUrl = 'https://example.com/sample-file.txt';
    const link = document.createElement('a');
    link.href = dummyFileUrl;
    link.download = 'sample-file.txt';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Side: Download Segment */}
      <div className="w-1/2 p-8 bg-white shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Download Files</h2>
        <p className="mb-4 text-gray-600">Click below to download the sample file:</p>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Download Sample File
        </button>
      </div>

      {/* Right Side: File Upload Segment */}
      <div className="w-1/2 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Files</h2>
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {selectedFile && (
          <p className="mb-4 text-gray-600">Selected file: {selectedFile.name}</p>
        )}
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Upload File
        </button>
      </div>
    </div>
  );
};

export default App;
