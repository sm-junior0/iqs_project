import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterEvaluator: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password }, 'evaluator');
      navigate('/dashboard/evaluator');
    } catch (error: any) {
      setErrors({ email: error.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Register as Evaluator</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
          <Input label="Email address" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} required />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} showPasswordToggle required />
          <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} showPasswordToggle required />
          <Button type="submit" className="w-full" disabled={isSubmitting} onClick={() => {}}>{isSubmitting ? 'Registering...' : 'Register'}</Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">Already have an account?{' '}<Link to="/auth/login" className="text-[#1B365D] hover:text-[#2563EB] font-medium transition-colors duration-200">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterEvaluator;
