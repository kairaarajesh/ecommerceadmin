import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile || '';

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(timer - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = (e) => {
    e.preventDefault();
    // Call API to verify OTP
    console.log("Verifying OTP:", otp);
    // On success, go to login
    navigate('/login');
  };

  const handleResendOtp = () => {
    // Call API to resend OTP
    console.log("Resending OTP to:", mobile);
    setTimer(30);
    setCanResend(false);
  };

  return (
    <div className="auth-container">
      <h2>Verify OTP</h2>
      <p>Enter the OTP sent to {mobile}</p>
      <form onSubmit={handleVerify}>
        <input 
          type="text" 
          placeholder="Enter 6-digit OTP" 
          value={otp} 
          onChange={(e) => setOtp(e.target.value)} 
          required 
        />
        <button type="submit">Verify & Proceed</button>
      </form>
      <div className="resend-section">
        {canResend ? (
          <button onClick={handleResendOtp} className="link-btn">Resend OTP</button>
        ) : (
          <p>Resend OTP in {timer}s</p>
        )}
      </div>
    </div>
  );
};
export default OtpVerification;