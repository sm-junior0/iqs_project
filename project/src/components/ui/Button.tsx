import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  style = {},
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#002855] hover:bg-[#001a3d] text-white focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105',
    secondary: 'bg-white hover:bg-gray-50 text-[#1B365D] border-2 border-[#1B365D] focus:ring-blue-500 shadow-md hover:shadow-lg transform hover:scale-105',
    outline: 'border-2 border-[#1B365D] text-[#1B365D] hover:bg-[#1B365D] hover:text-white focus:ring-blue-500 transform hover:scale-105',
    ghost: 'text-[#1B365D] hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizes = {
    sm: 'px-6 py-2 text-sm h-9',
    md: 'px-8 py-3 text-base h-12',
    lg: 'px-10 py-4 text-lg h-14'
  };

  const defaultStyle = {
    paddingTop: '7px',
    paddingRight: '30px',
    paddingBottom: '7px',
    paddingLeft: '30px',
    height: '45px',
    fontSize: '14px',
    ...style
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${size !== 'custom' ? sizes[size] : ''} ${className}`}
      onClick={onClick}
      style={size === 'custom' ? defaultStyle : style}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;