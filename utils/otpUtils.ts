// utils/otpUtils.ts
export const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  };
  