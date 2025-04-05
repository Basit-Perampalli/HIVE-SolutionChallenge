import React from 'react';

const FileUploadField = ({ label, name, file, verified, handleInputChange, handleVerify, documentType }) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="file-upload">
        <input
          type="file"
          name={name}
          onChange={handleInputChange}
          className="file-upload-input"
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <div className="upload-icon">📎</div>
        <p>{file ? file.name : 'Click to upload or drag and drop'}</p>
      </div>
      {file && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="button button-primary" 
            onClick={handleVerify}
            disabled={verified}
          >
            Verify
          </button>
          {verified && (
            <div className="verification-status status-success">
              ✓ Verification Successful
            </div>
          )}
          
        </div>
      )}
    </div>
  );
};

export default FileUploadField;