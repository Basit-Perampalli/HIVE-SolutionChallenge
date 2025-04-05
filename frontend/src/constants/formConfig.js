export const INITIAL_FORM_STATE = {
    // Personal Details
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    adhaar: '',
    adhaarFile: null,
    adhaarVerified: null,
  
    // Educational Details
    class10School: '',
    class10Percentage: '',
    class10Marksheet: null,
    class10Verified: null,
  
    class12College: '',
    class12Percentage: '',
    class12Marksheet: null,
    class12Verified: null,
  
    bachelorsUniversity: '',
    bachelorsPercentage: '',
    bachelorsMarksheet: null,
    bachelorsVerified: null
  };
  
  export const FORM_STEPS = {
    PERSONAL: 1,
    EDUCATIONAL: 2,
    PREVIEW: 3
  };
  
  export const ALLOWED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';