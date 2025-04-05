import React from 'react';

const PreviewReport = ({ formData }) => {
  const VerificationStatus = ({ verified }) => (
    <span className={`verification-status ${verified ? 'status-success' : 'status-error'}`}>
      {verified ? '✓ Verified' : '✗ Not Verified'}
    </span>
  );

  return (
    <div className="animate-fade-in">
      <div className="preview-section">
        <h3 className="section-title">Personal Details</h3>
        <div className="grid grid-2">
          <div>
            <p className="form-label">Name:</p>
            <p>{formData.name}</p>
          </div>
          <div>
            <p className="form-label">Email:</p>
            <p>{formData.email}</p>
          </div>
          <div>
            <p className="form-label">Phone:</p>
            <p>{formData.phone}</p>
          </div>
          <div>
            <p className="form-label">Date of Birth:</p>
            <p>{formData.dob}</p>
          </div>
          <div>
            <p className="form-label">Address:</p>
            <p>{formData.address}</p>
          </div>
          <div>
            <p className="form-label">Adhaar Number:</p>
            <p>{formData.adhaar}</p>
            <p className="form-label">Adhaar Verification:</p>
            <VerificationStatus verified={formData.adhaarVerified} />
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h3 className="section-title">Educational Details</h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <h4 className="section-title">Class X</h4>
          <div className="grid grid-2">
            <div>
              <p className="form-label">School:</p>
              <p>{formData.class10School}</p>
            </div>
            <div>
              <p className="form-label">Percentage:</p>
              <p>{formData.class10Percentage}%</p>
            </div>
            <div>
              <p className="form-label">Marksheet Verification:</p>
              <VerificationStatus verified={formData.class10Verified} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 className="section-title">Class XII</h4>
          <div className="grid grid-2">
            <div>
              <p className="form-label">College:</p>
              <p>{formData.class12College}</p>
            </div>
            <div>
              <p className="form-label">Percentage:</p>
              <p>{formData.class12Percentage}%</p>
            </div>
            <div>
              <p className="form-label">Marksheet Verification:</p>
              <VerificationStatus verified={formData.class12Verified} />
            </div>
          </div>
        </div>

        <div>
          <h4 className="section-title">Bachelors</h4>
          <div className="grid grid-2">
            <div>
              <p className="form-label">University:</p>
              <p>{formData.bachelorsUniversity}</p>
            </div>
            <div>
              <p className="form-label">Percentage:</p>
              <p>{formData.bachelorsPercentage}%</p>
            </div>
            <div>
              <p className="form-label">Marksheet Verification:</p>
              <VerificationStatus verified={formData.bachelorsVerified} />
            </div>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h3 className="section-title">Age Proof (PAN)</h3>
        <div className="grid grid-2">
          <div>
            <p className="form-label">PAN Number:</p>
            <p>{formData.pannumber}</p>
          </div>
          <div>
            <p className="form-label">PAN Card Verification:</p>
            <VerificationStatus verified={formData.panVerified} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default PreviewReport;