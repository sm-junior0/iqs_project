"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import {
  LayoutDashboard,
  Bell,
  Settings,
  Search,
  ChevronDown,
  X,
  FileIcon,
  Upload,
  Menu,
} from "lucide-react";
import JSZip from "jszip";
import { io } from "socket.io-client";

interface Application {
  id: string;
  applicationId: string;
  applicationDate: string;
  applicationStatus: "Pending" | "Approved" | "Rejected";
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

interface Feedback {
  id: string;
  message: string;
  author: string;
  timestamp: string;
}

const SchoolDashboard: React.FC = () => {
  // Application form state
  const [applicationId, setApplicationId] = useState("");
  const [applicationDesc, setApplicationDesc] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showApplicationModal, setShowApplicationModal] =
    useState<boolean>(false);
  const [showAccreditationInfoModal, setShowAccreditationInfoModal] =
    useState<boolean>(false);
  const [applicationStep, setApplicationStep] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(
    null
  );

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null
  );

  // Add state for new form fields
  const [registrationDoc, setRegistrationDoc] = useState<File | null>(null);
  const [curriculumDoc, setCurriculumDoc] = useState<File | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [country, setCountry] = useState("");
  const [accreditationType, setAccreditationType] = useState("new");

  // Add refs for file inputs
  const registrationInputRef = useRef<HTMLInputElement>(null);
  const curriculumInputRef = useRef<HTMLInputElement>(null);

  // Fetch applications (now using /applications endpoint)
  useEffect(() => {
    const fetchApplications = async () => {
      setApplicationsLoading(true);
      setApplicationsError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/school/applications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(
          (data.applications || []).map((app: any) => ({
            id: app.id,
            applicationId: app.id,
            applicationDate: app.submitted_at,
            applicationStatus:
              app.status === "approved"
                ? "Approved"
                : app.status === "pending"
                ? "Pending"
                : "Rejected",
          }))
        );
      } catch (err: any) {
        setApplicationsError(err.message || "Error fetching applications");
      } finally {
        setApplicationsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // State for viewing a specific application
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [viewAppLoading, setViewAppLoading] = useState(false);
  const [viewAppError, setViewAppError] = useState<string | null>(null);

  // State for certificates
  const [certificates, setCertificates] = useState<string[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certificatesError, setCertificatesError] = useState<string | null>(
    null
  );

  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      setCertificatesLoading(true);
      setCertificatesError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/school/certificates`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch certificates");
        const data = await res.json();
        setCertificates(data.certificates || []);
      } catch (err: any) {
        setCertificatesError(err.message || "Error fetching certificates");
      } finally {
        setCertificatesLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  // Add state for accreditation info modal
  const [accreditationInfo, setAccreditationInfo] = useState<any>(null);
  const [accreditationLoading, setAccreditationLoading] = useState(false);
  const [accreditationError, setAccreditationError] = useState<string | null>(
    null
  );

  // Handler to view application details and accreditation info
  const handleViewApplication = async (id: string) => {
    setAccreditationLoading(true);
    setAccreditationError(null);
    setAccreditationInfo(null);
    try {
      const token = localStorage.getItem("token");
      // Fetch application
      const appRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/school/application/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!appRes.ok) throw new Error("Failed to fetch application");
      const application = await appRes.json();
      // Fetch docs and school info from dashboard endpoint
      const docsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/school/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!docsRes.ok) throw new Error("Failed to fetch docs");
      const dashboard = await docsRes.json();
      // Assume school name/location from dashboard or fallback
      setAccreditationInfo({
        application,
        school: {
          name: dashboard.school?.name || "Your School",
          location: dashboard.school?.country || "Unknown",
        },
        registrationDocs: (dashboard.docs || []).filter(
          (doc: any) => doc.doc_type === "registration"
        ),
        curriculumDocs: (dashboard.docs || []).filter(
          (doc: any) => doc.doc_type === "curriculum"
        ),
      });
    } catch (err: any) {
      setAccreditationError(err.message);
    } finally {
      setAccreditationLoading(false);
    }
  };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/school/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await res.json();
        setDashboardStats(data.stats || null);
      } catch (err: any) {
        setStatsError(err.message || "Error fetching dashboard stats");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch feedback for the school
  useEffect(() => {
    const fetchFeedback = async () => {
      setFeedbackLoading(true);
      setFeedbackError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/school/feedback`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch feedback");
        const data = await res.json();
        setFeedback(
          (data.feedback || []).map((fb: any) => ({
            id: fb.id,
            message: fb.description || fb.message || "No feedback message",
            author: fb.evaluator_name || "Evaluator",
            timestamp: fb.created_at
              ? new Date(fb.created_at).toLocaleString()
              : "Unknown date",
          }))
        );
      } catch (err: any) {
        setFeedbackError(err.message || "Error fetching feedback");
      } finally {
        setFeedbackLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Message notification state
  type Message = {
    id: string;
    sender_id?: string;
    sender_name?: string;
    sender?: string;
    group_name?: string;
    message: string;
    timestamp: string;
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleApplyForAccreditation = () => {
    setShowApplicationModal(true);
    setApplicationStep(1);
  };

  const handleNextStep = () => {
    setApplicationStep(2);
  };

  const handleBackStep = () => {
    setApplicationStep(1);
  };

  const handleSubmitApplication = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const token = localStorage.getItem("token");
      console.log("Submitting application. Token:", token);
      const formData = new FormData();
      formData.append("name", schoolName);
      formData.append("country", country);
      formData.append("accreditation_type", accreditationType);
      if (registrationDoc) formData.append("registration_doc", registrationDoc);
      if (curriculumDoc) formData.append("curriculum_doc", curriculumDoc);
      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log("FormData:", key, value);
      }
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/school/first-time-apply`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      console.log("Response status:", res.status);
      const resData = await res.json().catch(() => ({}));
      console.log("Response data:", resData);
      if (!res.ok)
        throw new Error(resData.message || "Failed to submit application");
      setSubmitSuccess("Application submitted successfully!");
      setSchoolName("");
      setCountry("");
      setAccreditationType("new");
      setRegistrationDoc(null);
      setCurriculumDoc(null);
      setShowApplicationModal(false);
      setApplicationStep(1);
      // Refresh applications list
      const fetchApplications = async () => {
        setApplicationsLoading(true);
        setApplicationsError(null);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/school/track`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok) throw new Error("Failed to fetch applications");
          const data = await res.json();
          setApplications(data.applications || []);
        } catch (err: any) {
          setApplicationsError(err.message || "Error fetching applications");
        } finally {
          setApplicationsLoading(false);
        }
      };
      fetchApplications();
    } catch (err: any) {
      setSubmitError(err.message || "Error submitting application");
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Recent Applications Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Applications
        </h2>
        {applications.length === 0 ? (
          <p className="text-gray-500">No recent applications.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Id
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.slice(0, 3).map((application) => (
                  <tr key={application.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {application.applicationId}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {application.applicationDate}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          application.applicationStatus === "Approved"
                            ? "bg-green-100 text-green-800"
                            : application.applicationStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {application.applicationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Applications Stats */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Applications
            </p>
            {statsLoading ? (
              <p className="text-xl md:text-2xl text-gray-400">Loading...</p>
            ) : statsError ? (
              <p className="text-red-500 text-sm">{statsError}</p>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {dashboardStats?.totalApplications ?? applications.length}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Application
            </h2>
            <button
              onClick={handleApplyForAccreditation}
              className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto"
            >
              Apply for Accreditation
            </button>
          </div>
        </div>
        {/* Loading/Error States */}
        {applicationsLoading && (
          <div className="p-6 text-gray-500">Loading applications...</div>
        )}
        {applicationsError && (
          <div className="p-6 text-red-500">{applicationsError}</div>
        )}
        {/* Desktop Table */}
        {!applicationsLoading && !applicationsError && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Id
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No Applications
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.applicationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.applicationDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            application.applicationStatus === "Approved"
                              ? "bg-green-100 text-green-800"
                              : application.applicationStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {application.applicationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleViewApplication(application.id)}
                          className="bg-[#1B365D] text-white px-3 py-2 rounded text-sm hover:bg-[#2563EB] transition-colors "
                        >
                          View
                        </button>
                        {application.applicationStatus === "Pending" && (
                          <button className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors">
                            Delete
                          </button>
                        )}
                        {application.applicationStatus === "Approved" && (
                          <button
                            onClick={handleDownloadCertificate}
                            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Download Certificate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Mobile Cards */}
        {!applicationsLoading && !applicationsError && (
          <div className="md:hidden p-4 space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No Applications</p>
              </div>
            ) : (
              applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-gray-50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {application.applicationId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Date: {application.applicationDate}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        application.applicationStatus === "Approved"
                          ? "bg-green-100 text-green-800"
                          : application.applicationStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.applicationStatus}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewApplication(application.id)}
                      className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                    >
                      View
                    </button>
                    {application.applicationStatus === "Pending" && (
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    )}
                    {application.applicationStatus === "Approved" && (
                      <button
                        onClick={handleDownloadCertificate}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Download Certificate
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Notification
            </h2>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Recent Notification"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
            >
              <option>Today</option>
            </select>
          </div>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          {notifications.slice(0, 2).map((notification) => (
            <div
              key={notification.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 last:border-b-0 space-y-1 sm:space-y-0"
            >
              <p className="text-sm text-gray-900">{notification.message}</p>
              <span className="text-sm text-gray-500">
                {notification.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Feedback
            </h2>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search feedback"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
            >
              <option>Today</option>
            </select>
          </div>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          {feedbackLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B365D] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading feedback...</p>
            </div>
          )}

          {feedbackError && (
            <div className="text-center py-8">
              <p className="text-red-500">{feedbackError}</p>
            </div>
          )}

          {!feedbackLoading && !feedbackError && feedback.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No feedback found</p>
            </div>
          )}

          {!feedbackLoading &&
            !feedbackError &&
            feedback.length > 0 &&
            feedback.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0"
              >
                <p className="text-sm text-gray-900">{item.message}</p>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {item.author}
                  </p>
                  <span className="text-sm text-gray-500">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">
        Notifications
      </h1>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Messages & Notifications
          </h2>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          {messagesLoading && <div>Loading messages...</div>}
          {messagesError && <div className="text-red-500">{messagesError}</div>}
          {messages.length === 0 && !messagesLoading && (
            <div className="text-gray-500">No messages found.</div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-1 sm:space-y-0"
            >
              <div>
                <p className="text-sm text-gray-900 font-semibold">
                  {msg.sender_name || msg.sender || "Unknown Sender"}
                  {msg.group_name ? (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Group: {msg.group_name}
                    </span>
                  ) : (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Individual
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
              </div>
              <span className="text-sm text-gray-500">
                {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>

      {/* Personal Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          Personal Settings
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Names
            </label>
            <input
              type="text"
              defaultValue="Mike David"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              defaultValue="School Administrator"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue="david@gmail.com"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue="0788888888"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              defaultValue="Nairobi Kenya"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          Notifications
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification email
            </label>
            <input
              type="email"
              defaultValue="david@gmail.com"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sms Notification Number
            </label>
            <input
              type="tel"
              defaultValue="0788888888"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Notifications
          </label>
          <div className="relative">
            <select
              title="Select"
              className="w-full lg:w-1/2 border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent appearance-none"
            >
              <option>All</option>
              <option>Email Only</option>
              <option>SMS Only</option>
              <option>None</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none lg:right-1/2 lg:mr-2"
            />
          </div>
        </div>
      </div>

      {/* Data Backup */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          Data Backup
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Frequency
          </label>
          <div className="relative">
            <select
              title="Backup Frequency"
              className="w-full lg:w-1/2 border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent appearance-none"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none lg:right-1/2 lg:mr-2"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "notifications":
        return renderNotifications();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  // Download all docs as zip
  const handleDownloadAccreditationInfo = async () => {
    console.log("[Download] Button clicked");
    if (!accreditationInfo) {
      console.log("[Download] No accreditationInfo, aborting.");
      return;
    }
    console.log("[Download] accreditationInfo:", accreditationInfo);
    const zip = new JSZip();
    const allDocs = [
      ...(accreditationInfo.registrationDocs || []),
      ...(accreditationInfo.curriculumDocs || []),
    ];
    console.log("[Download] All docs to fetch:", allDocs);
    const token = localStorage.getItem("token");
    for (const doc of allDocs) {
      try {
        console.log(`[Download] Fetching: /${doc.doc_path}`);
        const res = await fetch(`/${doc.doc_path}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error(
            `[Download] Failed to fetch: /${doc.doc_path} (status: ${res.status})`
          );
          continue;
        }
        const blob = await res.blob();
        zip.file(doc.doc_path.split("/").pop(), blob);
        console.log(
          `[Download] Added to zip: ${doc.doc_path.split("/").pop()}`
        );
      } catch (e) {
        console.error(`[Download] Error fetching ${doc.doc_path}:`, e);
        // skip failed file
      }
    }
    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "accreditation_documents.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log("[Download] Zip download triggered.");
    } catch (e) {
      console.error("[Download] Error generating or downloading zip:", e);
    }
  };

  const handleDownloadCertificate = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/school/download-certificate`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) {
      alert("Failed to download certificate");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "certificate.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <DashboardNavbar />
      <div className="flex min-h-screen bg-gray-100">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1B365D] text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">Iqs Authority</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-white text-[#1B365D]"
                      : "text-white hover:bg-blue-700"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="md:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Iqs Authority
            </h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-6">{renderContent()}</div>
          </div>
        </div>

        {/* Application For Accreditation Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    Application For Accreditation
                  </h2>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                {applicationStep === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          School Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter School Name"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          School Country
                        </label>
                        <select
                          title="select country"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                        >
                          <option value="">Choose country</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Rwanda">Rwanda</option>
                          <option value="Uganda">Uganda</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accreditation Type
                      </label>
                      <select
                        title="select accredition"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                        value={accreditationType}
                        onChange={(e) => setAccreditationType(e.target.value)}
                        required
                      >
                        <option value="new">New</option>
                        <option value="renewal">Renewal</option>
                      </select>
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Registration Document (PDF)
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          setRegistrationDoc(e.target.files?.[0] || null)
                        }
                        required
                      />
                    </div> */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Curriculum Document (PDF)
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          setCurriculumDoc(e.target.files?.[0] || null)
                        }
                        required
                      />
                    </div> */}
                    <div className="flex justify-start">
                      <button
                        onClick={handleNextStep}
                        className="bg-[#1B365D] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors w-full md:w-auto"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {applicationStep === 2 && (
                  <>
                    {/* File upload areas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Registration Documents
                      </label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                        onClick={() => registrationInputRef.current?.click()}
                      >
                        <Upload
                          size={48}
                          className="text-gray-400 mx-auto mb-4"
                        />
                        <p className="text-gray-500">
                          {registrationDoc
                            ? registrationDoc.name
                            : "Upload school Registration Document"}
                        </p>
                        <input
                          type="file"
                          accept=".pdf"
                          ref={registrationInputRef}
                          style={{ display: "none" }}
                          onChange={(e) =>
                            setRegistrationDoc(e.target.files?.[0] || null)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Cirriculum
                      </label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                        onClick={() => curriculumInputRef.current?.click()}
                      >
                        <Upload
                          size={48}
                          className="text-gray-400 mx-auto mb-4"
                        />
                        <p className="text-gray-500">
                          {curriculumDoc
                            ? curriculumDoc.name
                            : "Upload school Cirriculum Document"}
                        </p>
                        <input
                          type="file"
                          accept=".pdf"
                          ref={curriculumInputRef}
                          style={{ display: "none" }}
                          onChange={(e) =>
                            setCurriculumDoc(e.target.files?.[0] || null)
                          }
                        />
                      </div>
                    </div>

                    {/* Show selected files as icons with names before upload */}
                    {(registrationDoc || curriculumDoc) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {registrationDoc && (
                          <div className="flex flex-col items-center p-4">
                            <FileIcon
                              size={48}
                              className="text-gray-400 mb-2"
                            />
                            <p className="text-sm text-gray-700 text-center">
                              {registrationDoc.name}
                            </p>
                          </div>
                        )}
                        {curriculumDoc && (
                          <div className="flex flex-col items-center p-4">
                            <FileIcon
                              size={48}
                              className="text-gray-400 mb-2"
                            />
                            <p className="text-sm text-gray-700 text-center">
                              {curriculumDoc.name}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={handleBackStep}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmitApplication}
                        className="bg-[#1B365D] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors w-full sm:w-auto"
                      >
                        Submit
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* School Accredition Information Modal */}
        {showAccreditationInfoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    School Accredition Information
                  </h2>
                  <button
                    onClick={() => setShowAccreditationInfoModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name
                    </label>
                    <p className="text-gray-900">Kingston High School</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Location
                    </label>
                    <p className="text-gray-900">Nairobi Kenya</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    School Registration Documents
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                      <FileIcon size={48} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-700 text-center">
                        Kingston High School report.pdf
                      </p>
                    </div>
                    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                      <FileIcon size={48} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-700 text-center">
                        Kingston High School report 2.pdf
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    School Cirriculum Documents
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                      <FileIcon size={48} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-700 text-center">
                        Kingston High School report.pdf
                      </p>
                    </div>
                    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                      <FileIcon size={48} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-700 text-center">
                        Kingston High School report 2.pdf
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-start">
                  <button
                    className="bg-[#1B365D] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors w-full md:w-auto"
                    onClick={handleDownloadAccreditationInfo}
                  >
                    Download Information
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Details Modal (Accreditation Info) */}
        {accreditationInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  School Accreditation Information
                </h2>
                <button
                  onClick={() => setAccreditationInfo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name
                    </label>
                    <p className="text-gray-900">
                      {accreditationInfo.school.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Location
                    </label>
                    <p className="text-gray-900">
                      {accreditationInfo.school.location}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    School Registration Documents
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accreditationInfo.registrationDocs.map(
                      (doc: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg"
                        >
                          <FileIcon size={48} className="text-gray-400 mb-2" />
                          <p className="text-sm text-gray-700 text-center">
                            {doc.doc_path.split("/").pop()}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    School Curriculum Documents
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accreditationInfo.curriculumDocs.map(
                      (doc: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg"
                        >
                          <FileIcon size={48} className="text-gray-400 mb-2" />
                          <p className="text-sm text-gray-700 text-center">
                            {doc.doc_path.split("/").pop()}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="flex justify-start">
                  <button className="bg-[#1B365D] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors w-full md:w-auto">
                    Download Information
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SchoolDashboard;
