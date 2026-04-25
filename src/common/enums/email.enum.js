export const otpSubjects = {
  Email: {
    confirm: "confirmEmail",
    maxTrials: "confirmEmail::maxTrials",
  },
  Password: {
    confirm: "forgotPassword",
    maxTrials: "forgotPassword::maxTrials",
  },
  twoStepsVerifecations: "twoStepsVerifecations",
};

export const otpState = {
  newOtp: "newOtp",
  resendOtp: "resendOtp",
};

export const otpPurpose = {
  Email: "Email",
  Password: "Password",
};
