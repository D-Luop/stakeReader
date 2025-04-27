// Create a new component, e.g., UploadForm.jsx
import React, { useState } from 'react';

function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('BetsFile', file);
    
    setLoading(true);
    try {
      const response = await fetch('localhost:3000/api/bets/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage(`Success: ${result.message}`);
        // Reload the page or update the data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-3 text-blue-300">Upload Bet Data</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input 
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Bet Data'}
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('Success') ? 'bg-green-700' : 'bg-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default UploadForm;