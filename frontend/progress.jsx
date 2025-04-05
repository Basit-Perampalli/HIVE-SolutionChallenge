import React, { useState } from 'react';
import { StepProgressBar } from 'react-step-progress-bar';
import 'react-step-progress-bar/styles.css';

const MyForm = () => {
  const [progress, setProgress] = useState(0);

  const handleStepChange = (step) => {
    setProgress(step);
  };

  return (
    <div>
      <h1>Form Progress</h1>
      <StepProgressBar
        steps={5}
        currentStep={progress}
        onStepClick={handleStepChange}
      >
        <div>
          <button onClick={() => handleStepChange(progress - 1)} disabled={progress <= 0}>
            Previous Step
          </button>
          <button onClick={() => handleStepChange(progress + 1)} disabled={progress >= 4}>
            Next Step
          </button>
        </div>
      </StepProgressBar>
    </div>
  );
};

export default MyForm;
