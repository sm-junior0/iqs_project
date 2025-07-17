import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Public/Home";

// Auth Pages
import Login from "./pages/Auth/Login";
import RegisterLanding from "./pages/Auth/RegisterLanding";
import RegisterAdmin from "./pages/Auth/RegisterAdmin";
import RegisterEvaluator from "./pages/Auth/RegisterEvaluator";
import RegisterSchool from "./pages/Auth/RegisterSchool";
import RegisterTrainer from "./pages/Auth/RegisterTrainer";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyCode from "./pages/Auth/VerifyCode";
import ResetPassword from "./pages/Auth/ResetPassword";

// Dashboard
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import TrainerDashboard from "./pages/Dashboard/TrainerDashboard";
import EvaluatorDashboard from "./pages/Dashboard/EvaluatorDashboard";
import SchoolDashboard from "./pages/Dashboard/SchoolDashboard";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<RegisterLanding />} />
            <Route path="/auth/register/admin" element={<RegisterAdmin />} />
            <Route
              path="/auth/register/evaluator"
              element={<RegisterEvaluator />}
            />
            <Route path="/auth/register/school" element={<RegisterSchool />} />
            <Route
              path="/auth/register/trainer"
              element={<RegisterTrainer />}
            />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/verify-code" element={<VerifyCode />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/trainer"
              element={
                <ProtectedRoute>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/evaluator"
              element={
                <ProtectedRoute>
                  <EvaluatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/school"
              element={
                <ProtectedRoute>
                  <SchoolDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
