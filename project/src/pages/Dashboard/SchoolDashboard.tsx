"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "../../context/AuthContext";
import ChatMessages from "../../components/ChatMessages";

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
  type: "info" | "success" | "warning" | "error";
  category: "application" | "evaluator" | "approval" | "feedback" | "general";
  read: boolean;
  data?: any;
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
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login", { replace: true });
    }
  }, [navigate]);
  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/auth/login", { replace: true });
  };

  // Handle new messages for conversation reordering and unread status
  const handleNewMessage = (data: any) => {
    // Move conversation to top and mark as unread
    setConversations((prevConversations) => {
      const updatedConversations = [...prevConversations];
      const conversationIndex = updatedConversations.findIndex(
        (conv) =>
          conv.conversation_id?.toString() ===
            data.conversationId?.toString() ||
          conv.id?.toString() === data.conversationId?.toString()
      );

      if (conversationIndex !== -1) {
        // Remove conversation from current position
        const [conversation] = updatedConversations.splice(
          conversationIndex,
          1
        );

        // Update conversation with new message and timestamp
        const updatedConversation = {
          ...conversation,
          updated_at: new Date().toISOString(),
          last_message: data.message,
        };

        // Add to top of list
        updatedConversations.unshift(updatedConversation);
      }

      return updatedConversations;
    });

    // Mark conversation as unread if not currently selected
    if (
      !selectedConversation ||
      (selectedConversation.conversation_id?.toString() !==
        data.conversationId?.toString() &&
        selectedConversation.id?.toString() !== data.conversationId?.toString())
    ) {
      setUnreadConversations((prev) =>
        new Set(prev).add(data.conversationId?.toString())
      );
    }
  };

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

  useEffect(() => {
    fetchApplications();
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/school/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setNotificationsError(err.message || "Error fetching notifications");
      // If notifications endpoint doesn't exist, create notifications from available data
      createNotificationsFromData();
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Create notifications from available data (applications, feedback, etc.)
  const createNotificationsFromData = () => {
    const generatedNotifications: Notification[] = [];

    // Create notifications from applications
    applications.forEach((app) => {
      if (app.applicationStatus === "Approved") {
        generatedNotifications.push({
          id: `app-approved-${app.id}`,
          message: `🎉 Congratulations! Your accreditation application has been approved.`,
          timestamp: app.applicationDate,
          type: "success",
          category: "approval",
          read: false,
          data: { applicationId: app.id },
        });
      } else if (app.applicationStatus === "Rejected") {
        generatedNotifications.push({
          id: `app-rejected-${app.id}`,
          message: `❌ Your accreditation application has been rejected. Please review and resubmit.`,
          timestamp: app.applicationDate,
          type: "error",
          category: "application",
          read: false,
          data: { applicationId: app.id },
        });
      } else if (app.applicationStatus === "Pending") {
        generatedNotifications.push({
          id: `app-pending-${app.id}`,
          message: `⏳ Your accreditation application is under review. We'll notify you once an evaluator is assigned.`,
          timestamp: app.applicationDate,
          type: "info",
          category: "application",
          read: false,
          data: { applicationId: app.id },
        });
      }
    });

    // Create notifications from feedback
    feedback.forEach((fb) => {
      generatedNotifications.push({
        id: `feedback-${fb.id}`,
        message: `💬 New feedback from ${fb.author}: ${fb.message}`,
        timestamp: fb.timestamp,
        type: "info",
        category: "feedback",
        read: false,
        data: { feedbackId: fb.id, author: fb.author },
      });
    });

    // Add some sample notifications for demonstration
    if (generatedNotifications.length === 0) {
      generatedNotifications.push(
        {
          id: "welcome-1",
          message:
            "👋 Welcome to IQS Authority! Your school dashboard is ready.",
          timestamp: new Date().toISOString(),
          type: "info",
          category: "general",
          read: false,
        },
        {
          id: "evaluator-assigned-1",
          message:
            "👨‍🏫 Evaluator John Smith has been assigned to review your application.",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          type: "success",
          category: "evaluator",
          read: false,
          data: { evaluatorName: "John Smith" },
        },
        {
          id: "visit-scheduled-1",
          message:
            "📅 School visit scheduled for next week. Please prepare your documents.",
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          type: "warning",
          category: "application",
          read: false,
        }
      );
    }

    setNotifications(generatedNotifications);
  };

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [applications, feedback]); // Re-run when applications or feedback change

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

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

  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(
    null
  );

  // Handler to delete an application
  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/school/application/${applicationToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete application");
      await fetchApplications();
      setShowDeleteModal(false);
      setApplicationToDelete(null);
    } catch (err: any) {
      alert(err.message || "Error deleting application");
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

  // Add state for chat
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  );
  const [unreadConversations, setUnreadConversations] = useState<Set<string>>(
    new Set()
  );
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState({
    id: user?.id || "",
    name: user?.fullName || "",
    email: user?.email || "",
    role: "school",
  });

  useEffect(() => {
    setProfile({
      id: user?.id || "",
      name: user?.fullName || "",
      email: user?.email || "",
      role: "school",
    });
    console.log("[SchoolDashboard] user:", user);
  }, [user]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/inbox`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        console.log("[SchoolDashboard] raw inbox data:", data.inbox);
        // Instead of filtering for conversations, filter for messages with group_name === 'schools'
        const filtered = (data.inbox || []).filter((msg: any) => {
          // Group messages for 'schools'
          if (msg.group_name === "schools") return true;
          // Direct messages to or from this school user
          if (msg.receiver_id === user?.id || msg.sender_id === user?.id)
            return true;
          return false;
        });
        // Show both group and direct messages as conversations
        const grouped = {};
        (filtered || []).forEach((msg: any) => {
          // Group by conversation_id
          if (!grouped[msg.conversation_id]) grouped[msg.conversation_id] = [];
          grouped[msg.conversation_id].push(msg);
        });
        console.log("[SchoolDashboard] grouped conversations:", grouped);
        // Use the latest message per conversation for the list
        const convList = Object.values(grouped).map(
          (msgs: any[]) => msgs[msgs.length - 1]
        );
        console.log("[SchoolDashboard] conversation list:", convList);
        setConversations(convList);
        if (convList.length > 0) {
          setSelectedConversation(convList[0]);
          console.log("[SchoolDashboard] selectedConversation:", convList[0]);
        }
      } catch (err) {
        // handle error
      }
    };
    if (user?.id) fetchConversations();
  }, [user?.id]);

  // Socket connection for real-time conversations
  useEffect(() => {
    // Only connect when user is loaded
    if (user?.id) {
      const socket = io(import.meta.env.VITE_API_URL);

      socket.on("connect", () => {
        console.log("SchoolDashboard: Socket connected for user:", user.id);
        socket.emit("register", user.id);
      });

      socket.on("receive-message", (data: any) => {
        console.log("SchoolDashboard: Received real-time message", data);
        handleNewMessage(data);
      });

      socket.on("new-conversation", (data: any) => {
        console.log("SchoolDashboard: New conversation", data);
        // Add new conversation to the list if it doesn't exist
        setConversations((prevConversations) => {
          const exists = prevConversations.some(
            (conv) => conv.id === data.conversationId
          );
          if (!exists) {
            const newConversation = {
              id: data.conversationId,
              type: data.type,
              last_message: data.message,
              updated_at: new Date().toISOString(),
              other_user_name: data.sender_name || "Unknown",
              other_user_id: data.sender_id,
              user_ids:
                data.type === "group" ? undefined : [user.id, data.sender_id],
              participants:
                data.type === "group"
                  ? []
                  : [{ id: data.sender_id, name: data.sender_name }],
            };
            return [newConversation, ...prevConversations];
          }
          return prevConversations;
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user?.id]); // Add user.id as dependency

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "messages", label: "Messages", icon: Bell },
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

      // Add notification for application submission
      const newNotification: Notification = {
        id: `app-submitted-${Date.now()}`,
        message:
          "📝 Your accreditation application has been submitted successfully and is now under review.",
        timestamp: new Date().toISOString(),
        type: "success",
        category: "application",
        read: false,
        data: { applicationId: resData.applicationId || Date.now().toString() },
      };
      setNotifications((prev) => [newNotification, ...prev]);

      setSchoolName("");
      setCountry("");
      setAccreditationType("new");
      setRegistrationDoc(null);
      setCurriculumDoc(null);
      setShowApplicationModal(false);
      setApplicationStep(1);
      // Refresh applications list
      await fetchApplications();
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
                          <button
                            onClick={() => {
                              setApplicationToDelete(application.id);
                              setShowDeleteModal(true);
                            }}
                            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                          >
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
                      <button
                        onClick={() => {
                          setApplicationToDelete(application.id);
                          setShowDeleteModal(true);
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Notifications
        </h1>
        {notifications.length > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-lg">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-lg">🔴</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-lg font-semibold text-gray-900">
                {notifications.filter((n) => !n.read).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-lg">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approvals</p>
              <p className="text-lg font-semibold text-gray-900">
                {notifications.filter((n) => n.category === "approval").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-lg">👨‍🏫</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Evaluators</p>
              <p className="text-lg font-semibold text-gray-900">
                {notifications.filter((n) => n.category === "evaluator").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Notifications
          </h2>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          {notificationsLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B365D] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          )}

          {notificationsError && (
            <div className="text-center py-8">
              <p className="text-red-500">{notificationsError}</p>
            </div>
          )}

          {!notificationsLoading &&
            !notificationsError &&
            notifications.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🔔</div>
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  We'll notify you about important updates
                </p>
              </div>
            )}

          {!notificationsLoading &&
            !notificationsError &&
            notifications.length > 0 && (
              <div className="space-y-3">
                {notifications
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        notification.read
                          ? "opacity-75"
                          : "ring-2 ring-blue-200"
                      } ${getNotificationColor(notification.type)}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="text-2xl mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                notification.read
                                  ? "text-gray-600"
                                  : "text-gray-900 font-medium"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  notification.category === "approval"
                                    ? "bg-green-100 text-green-800"
                                    : notification.category === "evaluator"
                                    ? "bg-blue-100 text-blue-800"
                                    : notification.category === "application"
                                    ? "bg-purple-100 text-purple-800"
                                    : notification.category === "feedback"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {notification.category.charAt(0).toUpperCase() +
                                  notification.category.slice(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  notification.timestamp
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  notification.timestamp
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>
      {/* Personal Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Personal Settings
          </h2>
          {!editProfile ? (
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setEditProfile(true)}
            >
              Edit
            </button>
          ) : null}
        </div>
        {profileSuccess && (
          <div className="mb-4 text-green-600 text-sm">{profileSuccess}</div>
        )}
        {profileError && (
          <div className="mb-4 text-red-600 text-sm">{profileError}</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Names
            </label>
            <input
              type="text"
              name="fullName"
              value={profileValues.fullName}
              onChange={handleProfileChange}
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
              readOnly={!editProfile}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profileValues.email}
              onChange={handleProfileChange}
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
              readOnly={!editProfile}
            />
          </div>
        </div>
        {editProfile && (
          <div className="flex gap-4 mt-8">
            <button
              className="bg-[#1B365D] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50"
              onClick={handleSaveProfile}
              disabled={profileLoading}
            >
              {profileLoading ? "Saving..." : "Save"}
            </button>
            <button
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={() => {
                setEditProfile(false);
                setProfileValues({
                  fullName: user?.fullName || "",
                  email: user?.email || "",
                  phoneNumber: "",
                  location: "",
                });
                setProfileError(null);
                setProfileSuccess(null);
              }}
              disabled={profileLoading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "messages":
        return renderMessages();
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

  const [editProfile, setEditProfile] = useState(false);
  const [profileValues, setProfileValues] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: "",
    location: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    setProfileValues((prev) => ({
      ...prev,
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: "",
    }));
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);
    try {
      // Placeholder for API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfileSuccess("Profile updated successfully!");
      setEditProfile(false);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Define renderMessages before renderContent
  const renderMessages = () => (
    <div className="flex h-full">
      <div className="w-1/3 border-r overflow-y-auto bg-white">
        {conversations.map((conv, idx) => {
          const conversationId = conv.conversation_id || conv.id;
          const isUnread = unreadConversations.has(conversationId?.toString());
          const isSelected =
            selectedConversation &&
            (selectedConversation.conversation_id ||
              selectedConversation.id) === (conv.conversation_id || conv.id);

          return (
            <div
              key={conversationId}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? "bg-blue-100" : ""
              }`}
              onClick={() => {
                setSelectedConversation(conv);
                // Clear unread status when conversation is selected
                if (isUnread) {
                  setUnreadConversations((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(conversationId?.toString());
                    return newSet;
                  });
                }
                console.log("[SchoolDashboard] selectedConversation:", conv);
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`font-semibold ${isUnread ? "font-bold" : ""}`}>
                  {conv.group_name || "Admin"}
                </p>
                {isUnread && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{conv.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(conv.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatMessages
            profile={profile}
            conversationId={
              selectedConversation.conversation_id || selectedConversation.id
            }
            recipientId={
              selectedConversation.group_name
                ? selectedConversation.group_name
                : selectedConversation.receiver_id === user?.id
                ? selectedConversation.sender_id
                : selectedConversation.receiver_id
            }
            conversationType={
              selectedConversation.group_name ? "group" : "user"
            }
            onNewMessage={handleNewMessage}
            isSelected={true}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* <DashboardNavbar /> */}
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
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              School Dashboard
            </h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="mb-6">
                Are you sure you want to delete this application?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApplication}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SchoolDashboard;
