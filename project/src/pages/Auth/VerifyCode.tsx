import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VerificationInput from '../../components/ui/VerificationInput';
import Button from '../../components/ui/Button';

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const { verifyCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleCodeComplete = (verificationCode: string): void => {
    setCode(verificationCode);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyCode(code);
      navigate('/auth/reset-password', { state: { code, email } });
    } catch (error) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    // Implement resend logic here
    console.log('Resending code to:', email);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-600">
            Enter the Verification code sent to your email account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <VerificationInput
              length={6}
              onComplete={handleCodeComplete}
              className="mb-4"
            />
            {error && (
              <p className="text-sm text-red-600 text-center mt-2">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || code.length !== 6}
          >
            {isSubmitting ? 'Verifying...' : 'Verify account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendCode}
            className="text-[#1B365D] hover:text-[#2563EB] font-medium transition-colors duration-200"
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;