import React from 'react';
import { Link } from 'react-router-dom';

const RegisterLanding: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full">
      <h2 className="text-2xl font-bold text-center mb-6">Register as</h2>
      <div className="flex flex-col space-y-4">
        <Link
          to="/auth/register/admin"
          className="w-full text-center px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Administrator
        </Link>
        <Link
          to="/auth/register/evaluator"
          className="w-full text-center px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          Evaluator
        </Link>
        <Link
          to="/auth/register/school"
          className="w-full text-center px-4 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
        >
          Educational Institution
        </Link>
        <Link
          to="/auth/register/trainer"
          className="w-full text-center px-4 py-3 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
        >
          Trainer
        </Link>
      </div>
      <div className="mt-8 text-center">
        <span className="text-gray-600">Already have an account? </span>
        <Link to="/auth/login" className="text-blue-600 hover:underline">Sign in</Link>
      </div>
    </div>
  </div>
);

export default RegisterLanding;
