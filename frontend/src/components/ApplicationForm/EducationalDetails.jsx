import React from 'react';
import FileUploadField from './FileUploadField';

const EducationSection = ({ title, formData, schoolField, percentageField, fileField, verifiedField, handleInputChange, handleVerify }) => (
  <div className="preview-section">
    <h3 className="section-title">{title}</h3>
    <div className="grid grid-2">
      <div className="form-group">
        <label className="form-label">Institution Name</label>
        <input
          type="text"
          name={schoolField}
          value={formData[schoolField]}
          onChange={handleInputChange}
          className="form-input"
          placeholder="Enter institution name"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Percentage</label>
        <input
          type="number"
          name={percentageField}
          value={formData[percentageField]}
          onChange={handleInputChange}
          className="form-input"
          placeholder="Enter percentage"
          min="0"
          max="100"
        />
      </div>
      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <FileUploadField
          label="Upload Marksheet"
          name={fileField}
          file={formData[fileField]}
          verified={formData[verifiedField]}
          handleInputChange={handleInputChange}
          handleVerify={handleVerify}
        />
      </div>
    </div>
  </div>
);

const EducationalDetails = ({ formData, handleInputChange, handleVerify }) => {
  return (
    <div className="animate-fade-in">
      <EducationSection
        title="Class X Details"
        formData={formData}
        schoolField="class10School"
        percentageField="class10Percentage"
        fileField="class10Marksheet"
        verifiedField="class10Verified"
        handleInputChange={handleInputChange}
        handleVerify={() => handleVerify('x')}
      />

      <EducationSection
        title="Class XII Details"
        formData={formData}
        schoolField="class12College"
        percentageField="class12Percentage"
        fileField="class12Marksheet"
        verifiedField="class12Verified"
        handleInputChange={handleInputChange}
        handleVerify={() => handleVerify('xii')}
      />

      <EducationSection
        title="Bachelors Details"
        formData={formData}
        schoolField="bachelorsUniversity"
        percentageField="bachelorsPercentage"
        fileField="bachelorsMarksheet"
        verifiedField="bachelorsVerified"
        handleInputChange={handleInputChange}
        handleVerify={() => handleVerify('b')}
      />
    </div>
  );
};

export default EducationalDetails;