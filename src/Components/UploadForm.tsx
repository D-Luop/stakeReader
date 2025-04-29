import React, { useState } from 'react';

const UploadForm = ({ 
  uploadType = 'bets', 
  fileType = null,
  onDataUploaded = null // Add callback prop for when data is uploaded successfully
}) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  // Get the appropriate title and description based on upload and file types
  const getFormTitle = () => {
    if (uploadType === 'bets') return 'Upload Bet History';
    if (uploadType === 'transactions') {
      if (fileType === 'deposit') return 'Upload Deposits';
      if (fileType === 'withdraw') return 'Upload Withdrawals';
      return 'Upload Transactions';
    }
    return 'Upload Files';
  };

  const getFileTypeDescription = () => {
    if (uploadType === 'bets') return 'Bet Files';
    if (uploadType === 'transactions') {
      if (fileType === 'deposit') return 'Deposit Files';
      if (fileType === 'withdraw') return 'Withdrawal Files';
      return 'Transaction Files';
    }
    return 'JSON Files';
  };

  const getAcceptFileTypes = () => {
    if (uploadType === 'bets') return '.json';
    if (uploadType === 'transactions') return '.json,.csv';
    return '.json';
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    // Clear previous results when new files are selected
    setUploadResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add fileType as a parameter if it's specified (for deposits/withdrawals)
    if (fileType) {
      formData.append('fileType', fileType);
    }
    
    try {
      const endpoint = `/api/upload/${uploadType}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }
      
      setUploadResult(result);
      setFiles([]);
      // Reset file input
      document.getElementById(`fileInput-${uploadType}-${fileType || 'default'}`).value = '';
      
      // If upload was successful and server indicates refresh is needed
      if (result.shouldRefresh && onDataUploaded) {
        // Call the callback to refresh data
        onDataUploaded();
      }
    } catch (err) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const getResultMessage = (result) => {
    if (!result) return '';
    
    const parts = [result.message];
    
    if (result.duplicatesSkipped > 0) {
      parts.push(`${result.duplicatesSkipped} duplicates skipped`);
    }
    
    if (result.skipped > 0) {
      parts.push(`${result.skipped} invalid entries skipped`);
    }
    
    return parts.join('. ');
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">
            {getFileTypeDescription()} ({getAcceptFileTypes()})
          </label>
          <input
            id={`fileInput-${uploadType}-${fileType || 'default'}`}
            type="file"
            accept={getAcceptFileTypes()}
            multiple
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded 
                     file:border-0 file:bg-gray-600 file:text-white
                     hover:file:bg-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {files.length > 0 ? `${files.length} files selected` : 'Select files to upload'}
            {uploadType === 'transactions' && (
              <span className="block mt-1">
                CSV files with transaction data can be uploaded for {fileType === 'deposit' ? 'deposits' : 'withdrawals'}
              </span>
            )}
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isUploading || files.length === 0}
          className={`w-full py-2 text-sm rounded font-medium transition-colors ${
            isUploading || files.length === 0
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Uploading...' : `Upload ${getFileTypeDescription()}`}
        </button>
      </form>
      
      {error && (
        <div className="mt-3 bg-red-900/30 text-red-300 p-2 rounded text-sm">
          <p>{error}</p>
        </div>
      )}
      
      {uploadResult && (
        <div className="mt-3 bg-green-900/30 text-green-300 p-2 rounded text-sm">
          <p>{getResultMessage(uploadResult)}</p>
          {uploadResult.invalidFiles && uploadResult.invalidFiles.length > 0 && (
            <details className="mt-1 text-xs">
              <summary>Show invalid files</summary>
              <ul className="mt-1 list-disc list-inside">
                {uploadResult.invalidFiles.map((file, index) => (
                  <li key={index}>{file.name}: {file.error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadForm;