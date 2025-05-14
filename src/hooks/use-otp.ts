
import { useState, useCallback } from "react";

export function useOTP(length: number) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));

  const handleOTPChange = useCallback((index: number, value: string) => {
    setOtp(prev => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });
  }, []);

  const resetOTP = useCallback(() => {
    setOtp(Array(length).fill(""));
  }, [length]);

  const getOTPString = useCallback(() => {
    return otp.join("");
  }, [otp]);

  return {
    otp,
    handleOTPChange,
    resetOTP,
    getOTPString
  };
}
