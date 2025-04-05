import React from 'react';
import FileUploadField from './FileUploadField';

const AgeProof = ({ formData, handleInputChange, handleVerify }) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">PAN Number</label>
          <input
            type="text"
            name="pannumber"
            value={formData.pannumber}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your Pan Number"
          />
        </div>
        

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <FileUploadField
            label="Upload Pan Card"
            name="panFile"
            file={formData.panFile}
            verified={formData.panVerified}
            handleInputChange={handleInputChange}
            handleVerify={() => handleVerify('pan')}
          />
        </div>
      </div>
    </div>
  );
};

export default AgeProof;