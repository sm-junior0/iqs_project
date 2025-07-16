import React, { useState, useRef, useEffect } from 'react';

interface VerificationInputProps {
  length?: number;
  onComplete: (code: string) => void;
  className?: string;
}

const VerificationInput: React.FC<VerificationInputProps> = ({ 
  length = 6, 
  onComplete, 
  className = '' 
}) => {
  const [values, setValues] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string): void => {
    if (value.length > 1) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all inputs are filled
    if (newValues.every(val => val !== '')) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    const newValues = [...values];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (i < length) {
        newValues[i] = pastedData[i];
      }
    }
    
    setValues(newValues);
    
    if (newValues.every(val => val !== '')) {
      onComplete(newValues.join(''));
    }
  };

  return (
    <div className={`flex space-x-3 justify-center ${className}`}>
      {values.map((value, index) => (
        <input
        title='select'
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          value={value}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D] focus:ring-opacity-20 outline-none transition-all duration-200"
          maxLength={1}
        />
      ))}
    </div>
  );
};

export default VerificationInput;