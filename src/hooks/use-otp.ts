
import { useState } from 'react';

export function useOTP(length: number = 6) {
  const [otp, setOTP] = useState<string[]>(Array(length).fill(''));

  const handleOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    // Update OTP array
    const newOTP = [...otp];
    
    // If pasting multiple characters
    if (value.length > 1) {
      // Handle pasting of full OTP code
      const pastedChars = value.split('').slice(0, length);
      const newOTPArray = Array(length).fill('');
      
      pastedChars.forEach((char, idx) => {
        if (idx < length) newOTPArray[idx] = char;
      });
      
      setOTP(newOTPArray);
      return;
    }
    
    // Handle single character
    newOTP[index] = value;
    setOTP(newOTP);
    
    // Auto-focus next input if current input is filled
    if (value !== '' && index < length - 1) {
      const inputs = document.querySelectorAll('input[name^="otpInput"]');
      if (inputs[index + 1]) {
        (inputs[index + 1] as HTMLInputElement).focus();
      }
    }
  };

  const resetOTP = () => {
    setOTP(Array(length).fill(''));
  };

  const getOTPString = () => {
    return otp.join('');
  };

  return {
    otp,
    setOTP,
    handleOTPChange,
    resetOTP,
    getOTPString
  };
}
