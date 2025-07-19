"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  School,
  FileText,
  History,
  Settings,
  Search,
  ChevronDown,
  TrendingUp,
  X,
  FileIcon,
  Upload,
  Menu,
  MessageSquare,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import ChatMessages from "../../components/ChatMessages";

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

interface AssignedSchool {
  id: string;
  name: string;
  country: string;
  status: string;
  evaluator_id: string;
  certificate_path?: string;
  created_at: string;
}

interface Report {
  id: string;
  school_id: string;
  evaluator_id: string;
  report_path: string;
  visit_date: string;
  created_at: string;
  school_name?: string; // We'll add this from the schools data
}

interface HistoryItem {
  id: string;
  action: string;
  timestamp: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  category: "assignment" | "report" | "feedback" | "task" | "general";
  read: boolean;
  data?: any;
}

const EvaluatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showAddReportModal, setShowAddReportModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    rating: "",
    type: "",
    description: "",
    schoolId: "",
  });
  const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Real data state
  const [assignedSchools, setAssignedSchools] = useState<AssignedSchool[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState<boolean>(true);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState<boolean>(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // Upload report state
  const [uploadForm, setUploadForm] = useState({
    school_id: "",
    visit_date: "",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    created_at: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(
    null
  );
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState<
    string | null
  >(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [newMessages, setNewMessages] = useState<any[]>([]); // Store new real-time messages
  const [messages, setMessages] = useState<any[]>([]); // Store historical messages
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState(""); // New: message input state
  const [sendLoading, setSendLoading] = useState(false); // New: sending state
  const [sendError, setSendError] = useState<string | null>(null); // New: send error

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  );
  const [unreadConversations, setUnreadConversations] = useState<Set<string>>(
    new Set()
  );

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null
  );

  const navigate = useNavigate();

  // Fetch assigned schools
  useEffect(() => {
    const fetchAssignedSchools = async () => {
      setSchoolsLoading(true);
      setSchoolsError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/evaluator/my-schools`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch assigned schools");
        const data = await res.json();
        setAssignedSchools(data);
      } catch (err: any) {
        setSchoolsError(err.message || "Error fetching assigned schools");
        console.error("Error fetching assigned schools:", err);
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchAssignedSchools();
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/evaluator/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.profile);
        setProfileForm({
          name: data.profile.name,
          email: data.profile.email,
        });
      } catch (err: any) {
        setProfileError(err.message || "Error fetching profile");
        console.error("Error fetching profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setReportsLoading(true);
      setReportsError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/evaluator/visit-history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();

        // Add school names to reports
        const reportsWithSchoolNames = data.visits.map((report: Report) => {
          const school = assignedSchools.find((s) => s.id === report.school_id);
          return {
            ...report,
            school_name: school?.name || "Unknown School",
          };
        });

        setReports(reportsWithSchoolNames);
      } catch (err: any) {
        setReportsError(err.message || "Error fetching reports");
        console.error("Error fetching reports:", err);
      } finally {
        setReportsLoading(false);
      }
    };

    if (assignedSchools.length > 0) {
      fetchReports();
    }
  }, [assignedSchools]);

  // Real-time messaging setup
  useEffect(() => {
    if (profile.id) {
      const s = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
      s.emit("register", profile.id);
      s.on("receive-message", (data: any) => {
        // Show notification (replace alert with toast/snackbar in production)
        alert(`New message from ${data.from}: ${data.message}`);
        setNewMessages((prev) => [...prev, data]);
      });
      setSocket(s);
      return () => {
        s.disconnect();
      };
    }
  }, [profile.id]);

  // Fetch historical messages (inbox)
  useEffect(() => {
    const fetchMessages = async () => {
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/inbox`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data.inbox || []);
      } catch (err: any) {
        setMessagesError(err.message || "Error fetching messages");
      } finally {
        setMessagesLoading(false);
      }
    };
    if (profile.id) fetchMessages();
  }, [profile.id]);

  // Fetch conversations (groups and direct)
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
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        setConversations(data.inbox || []);
        // Default to first conversation
        if (!selectedConversation && data.inbox && data.inbox.length > 0) {
          setSelectedConversation(data.inbox[0]);
        }
      } catch (err) {
        // handle error
      }
    };
    fetchConversations();
  }, [profile.id]);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
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

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/evaluator/notifications`,
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

  // Create notifications from available data (assigned schools, reports, etc.)
  const createNotificationsFromData = () => {
    const generatedNotifications: Notification[] = [];

    // Create notifications from assigned schools
    assignedSchools.forEach((school) => {
      if (school.status === "pending") {
        generatedNotifications.push({
          id: `school-assigned-${school.id}`,
          message: `🏫 New school assigned: ${school.name} in ${school.country}`,
          timestamp: school.created_at,
          type: "success",
          category: "assignment",
          read: false,
          data: { schoolId: school.id, schoolName: school.name },
        });
      }
    });

    // Create notifications from reports
    reports.forEach((report) => {
      generatedNotifications.push({
        id: `report-uploaded-${report.id}`,
        message: `📄 Report uploaded for ${report.school_name || "School"}`,
        timestamp: report.created_at,
        type: "info",
        category: "report",
        read: false,
        data: { reportId: report.id, schoolName: report.school_name },
      });
    });

    // Add some sample notifications for demonstration
    if (generatedNotifications.length === 0) {
      generatedNotifications.push(
        {
          id: "welcome-1",
          message:
            "👋 Welcome to IQS Authority! Your evaluator dashboard is ready.",
          timestamp: new Date().toISOString(),
          type: "info",
          category: "general",
          read: false,
        },
        {
          id: "task-assigned-1",
          message:
            "📋 New evaluation task assigned: Review Kingstone School documents",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          type: "warning",
          category: "task",
          read: false,
          data: { taskId: 1, schoolName: "Kingstone School" },
        },
        {
          id: "feedback-received-1",
          message: "💬 Feedback received from admin on your latest report",
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          type: "info",
          category: "feedback",
          read: false,
        }
      );
    }

    setNotifications(generatedNotifications);
  };

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

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [assignedSchools, reports]); // Re-run when assigned schools or reports change

  const stats: StatCard[] = [
    {
      title: "Assigned Schools",
      value: assignedSchools.length.toString(),
      change: "15%",
      icon: <span className="text-lg font-bold">$</span>,
    },
    {
      title: "Total Reports",
      value: reports.length.toString(),
      change: "15%",
      icon: <span className="text-lg font-bold">$</span>,
    },
  ];

  const historyItems: HistoryItem[] = Array(12)
    .fill(null)
    .map((_, i) => ({
      id: `history-${i}`,
      action: "You have updated the kingston highschool report",
      timestamp: "30 min ago",
    }));

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "schools", label: "Schools", icon: School },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const ReportsTrendChart = () => {
    // Process reports data to get monthly counts
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1; // 1-12 for months
      const year = new Date().getFullYear();
      const count = reports.filter((report) => {
        const reportDate = new Date(report.visit_date);
        return reportDate.getMonth() === i && reportDate.getFullYear() === year;
      }).length;
      return { month, count };
    });

    const maxCount = Math.max(...monthlyData.map((d) => d.count), 1); // At least 1 to avoid division by zero
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          Reports Trend Summary ({new Date().getFullYear()})
        </h3>
        <div className="h-48 md:h-64">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            {/* Chart bars */}
            {monthlyData.map((data, i) => {
              const barHeight = (data.count / maxCount) * 120; // Max height 120
              const y = 180 - barHeight; // Start from bottom (180)
              return (
                <rect
                  key={i}
                  x={50 + i * 60}
                  y={y}
                  width={40}
                  height={barHeight}
                  fill="#1B365D"
                  className="hover:fill-blue-700 transition-colors"
                />
              );
            })}

            {/* Y-axis labels */}
            <text x="20" y="60" className="text-xs fill-gray-500">
              {maxCount}
            </text>
            <text x="20" y="100" className="text-xs fill-gray-500">
              {Math.round(maxCount * 0.75)}
            </text>
            <text x="20" y="140" className="text-xs fill-gray-500">
              {Math.round(maxCount * 0.5)}
            </text>
            <text x="20" y="180" className="text-xs fill-gray-500">
              {Math.round(maxCount * 0.25)}
            </text>
            <text x="30" y="195" className="text-xs fill-gray-500">
              0
            </text>

            {/* X-axis labels */}
            {monthNames.map((month, i) => (
              <text
                key={month}
                x={70 + i * 60}
                y="195"
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {month}
              </text>
            ))}

            {/* Data labels on bars */}
            {monthlyData.map((data, i) => {
              const barHeight = (data.count / maxCount) * 120;
              const y = 180 - barHeight;
              return (
                <text
                  key={`label-${i}`}
                  x={70 + i * 60}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-700 font-medium"
                >
                  {data.count}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Total Reports</p>
            <p className="text-lg font-bold text-gray-900">{reports.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">This Month</p>
            <p className="text-lg font-bold text-gray-900">
              {monthlyData[new Date().getMonth()].count}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Last Month</p>
            <p className="text-lg font-bold text-gray-900">
              {monthlyData[new Date().getMonth() - 1]?.count || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg/Month</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.round(reports.length / 12)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleGiveFeedback = (school: AssignedSchool) => {
    setFeedbackForm({
      rating: "",
      type: "",
      description: "",
      schoolId: school.id,
    });
    setFeedbackFile(null);
    setFeedbackError(null);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (
      !feedbackForm.rating ||
      !feedbackForm.type ||
      !feedbackForm.description
    ) {
      setFeedbackError("Please fill in all required fields");
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("rating", feedbackForm.rating);
      formData.append("type", feedbackForm.type);
      formData.append("description", feedbackForm.description);

      if (feedbackFile) {
        formData.append("supportingDocument", feedbackFile);
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/evaluator/schools/${
          feedbackForm.schoolId
        }/feedback`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit feedback");
      }

      const data = await res.json();
      alert("Feedback submitted successfully!");
      setShowFeedbackModal(false);
      setFeedbackForm({ rating: "", type: "", description: "", schoolId: "" });
      setFeedbackFile(null);
    } catch (err: any) {
      setFeedbackError(err.message || "Error submitting feedback");
      console.error("Error submitting feedback:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeedbackFile(file);
    }
  };

  const handleUploadFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadReport = async () => {
    if (!uploadForm.school_id || !uploadForm.visit_date || !uploadFile) {
      setUploadError("Please fill in all required fields and select a file");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("school_id", uploadForm.school_id);
      formData.append("visit_date", uploadForm.visit_date);
      formData.append("file", uploadFile);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/evaluator/upload-report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload report");
      }

      const data = await res.json();
      alert("Report uploaded successfully!");
      setShowAddReportModal(false);
      setUploadForm({ school_id: "", visit_date: "" });
      setUploadFile(null);

      // Refresh reports list
      if (assignedSchools.length > 0) {
        const fetchReports = async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/evaluator/visit-history`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!res.ok) throw new Error("Failed to fetch reports");
            const data = await res.json();

            const reportsWithSchoolNames = data.visits.map((report: Report) => {
              const school = assignedSchools.find(
                (s) => s.id === report.school_id
              );
              return {
                ...report,
                school_name: school?.name || "Unknown School",
              };
            });

            setReports(reportsWithSchoolNames);
          } catch (err: any) {
            console.error("Error refreshing reports:", err);
          }
        };
        fetchReports();
      }
    } catch (err: any) {
      setUploadError(err.message || "Error uploading report");
      console.error("Error uploading report:", err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenUploadModal = () => {
    setUploadForm({ school_id: "", visit_date: "" });
    setUploadFile(null);
    setUploadError(null);
    setShowAddReportModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name || !profileForm.email) {
      setProfileUpdateError("Please fill in all required fields");
      return;
    }

    setProfileUpdateLoading(true);
    setProfileUpdateError(null);
    setProfileUpdateSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/evaluator/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileForm),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await res.json();
      setProfileUpdateSuccess("Profile updated successfully!");
      setProfile(data.profile);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setProfileUpdateSuccess(null);
      }, 3000);
    } catch (err: any) {
      setProfileUpdateError(err.message || "Error updating profile");
      console.error("Error updating profile:", err);
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/evaluator/report/download/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the response is ok before proceeding
      if (!res.ok) {
        throw new Error(
          `Failed to download report: ${res.status} ${res.statusText}`
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error downloading report:", err);
      alert(err.message || "Failed to download report");
    }
  };

  // Helper: check if message is sent by evaluator (current user)
  const isSentByMe = (msg: any) => msg.sender_id === profile.id;

  // Send message to admin
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    setSendLoading(true);
    setSendError(null);
    try {
      const token = localStorage.getItem("token");
      // Assume admin has id 'admin' or get from env/config if needed
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipient_id: "admin", // Adjust if admin id is different
            message: messageInput,
          }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send message");
      }
      // Optimistically add message to chat
      setMessages((prev) => [
        ...prev,
        {
          sender_id: profile.id,
          message: messageInput,
          created_at: new Date().toISOString(),
        },
      ]);
      setMessageInput("");
    } catch (err: any) {
      setSendError(err.message || "Error sending message");
    } finally {
      setSendLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 md:p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                  <span className="text-xs md:text-sm text-green-500">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="bg-[#1B365D] text-white p-2 md:p-3 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned Schools */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Assigned Schools
            </h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto">
              See All
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search School"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schoolsLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading assigned schools...
                  </td>
                </tr>
              ) : schoolsError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-red-500"
                  >
                    {schoolsError}
                  </td>
                </tr>
              ) : assignedSchools.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No schools assigned yet.
                  </td>
                </tr>
              ) : (
                assignedSchools.map((school) => (
                  <tr key={school.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          school.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(school.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {schoolsLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading assigned schools...
            </div>
          ) : schoolsError ? (
            <div className="p-4 text-center text-sm text-red-500">
              {schoolsError}
            </div>
          ) : assignedSchools.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No schools assigned yet.
            </div>
          ) : (
            assignedSchools.map((school) => (
              <div key={school.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {school.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      school.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {school.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Country:</span>{" "}
                    {school.country}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(school.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Recent Reports
            </h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto">
              See All
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading reports...
                  </td>
                </tr>
              ) : reportsError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-red-500"
                  >
                    {reportsError}
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.school_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.school_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.visit_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleViewReport(report)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {reportsLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading reports...
            </div>
          ) : reportsError ? (
            <div className="p-4 text-center text-sm text-red-500">
              {reportsError}
            </div>
          ) : reports.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No reports found.
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {report.school_name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Location:</span>{" "}
                    {report.school_name}
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span>{" "}
                    {new Date(report.visit_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="bg-[#1B365D] text-white px-3 py-1 rounded text-xs hover:bg-[#2563EB] transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleViewReport(report)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    View
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderSchools = () => (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Schools</h1>

      {/* Assigned Schools Stats */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border max-w-full sm:max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">
              Assigned Schools
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {assignedSchools.length}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-xs md:text-sm text-green-500">15%</span>
            </div>
          </div>
          <div className="bg-[#1B365D] text-white p-2 md:p-3 rounded-lg">
            <span className="text-lg font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Assigned Schools Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Assigned Schools ({assignedSchools.length})
            </h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto">
              Load More
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search School"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schoolsLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading assigned schools...
                  </td>
                </tr>
              ) : schoolsError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-red-500"
                  >
                    {schoolsError}
                  </td>
                </tr>
              ) : assignedSchools.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No schools assigned yet.
                  </td>
                </tr>
              ) : (
                assignedSchools.map((school) => (
                  <tr key={school.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          school.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(school.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleGiveFeedback(school)}
                        className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
                      >
                        Give School Feedback
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {schoolsLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading assigned schools...
            </div>
          ) : schoolsError ? (
            <div className="p-4 text-center text-sm text-red-500">
              {schoolsError}
            </div>
          ) : assignedSchools.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No schools assigned yet.
            </div>
          ) : (
            assignedSchools.map((school) => (
              <div key={school.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {school.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      school.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {school.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Country:</span>{" "}
                    {school.country}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(school.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleGiveFeedback(school)}
                  className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#2563EB] transition-colors w-full"
                >
                  Give School Feedback
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Reports</h1>

      {/* Stats Card */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border max-w-full sm:max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">
              Total Reports
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {reports.length}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-xs md:text-sm text-green-500">15%</span>
            </div>
          </div>
          <div className="bg-[#1B365D] text-white p-2 md:p-3 rounded-lg">
            <span className="text-lg font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Reports Trend Chart */}
      <ReportsTrendChart />

      {/* Uploaded Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Uploaded Reports ({reports.length})
            </h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleOpenUploadModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto"
              >
                Add new Report
              </button>
              <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto">
                See All
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading reports...
                  </td>
                </tr>
              ) : reportsError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-red-500"
                  >
                    {reportsError}
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.school_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.visit_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleViewReport(report)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {reportsLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading reports...
            </div>
          ) : reportsError ? (
            <div className="p-4 text-center text-sm text-red-500">
              {reportsError}
            </div>
          ) : reports.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No reports found.
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {report.school_name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Visit Date:</span>{" "}
                    {new Date(report.visit_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="bg-[#1B365D] text-white px-3 py-1 rounded text-xs hover:bg-[#2563EB] transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleViewReport(report)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    View
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
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
              <span className="text-green-600 text-lg">🏫</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-lg font-semibold text-gray-900">
                {
                  notifications.filter((n) => n.category === "assignment")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-lg">📄</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Reports</p>
              <p className="text-lg font-semibold text-gray-900">
                {notifications.filter((n) => n.category === "report").length}
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
                                  notification.category === "assignment"
                                    ? "bg-green-100 text-green-800"
                                    : notification.category === "report"
                                    ? "bg-blue-100 text-blue-800"
                                    : notification.category === "task"
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
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>

      {/* Personal Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-8">
          Personal Settings
        </h2>

        {profileLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading profile...</div>
          </div>
        ) : profileError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {profileError}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Full Names
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
                />
              </div>
            </div>

            {/* Update Profile Button */}
            <div className="flex justify-start mt-6 md:mt-8">
              <button
                onClick={handleUpdateProfile}
                disabled={profileUpdateLoading}
                className="bg-[#1B365D] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors text-sm md:text-base w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileUpdateLoading ? "Updating..." : "Update Profile"}
              </button>
            </div>
            {profileUpdateSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
                {profileUpdateSuccess}
              </div>
            )}
            {profileUpdateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                {profileUpdateError}
              </div>
            )}
          </>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-8">
          Notifications
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Notification email
            </label>
            <input
              type="email"
              value={profile.email}
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
              readOnly
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              SMS Notification Number
            </label>
            <input
              type="tel"
              placeholder="Not configured"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
              disabled
            />
          </div>
        </div>

        <div className="mt-6 md:mt-8">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            Allowed Notifications
          </label>
          <div className="relative">
            <select
              title="send"
              className="w-full lg:w-1/2 border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent appearance-none text-sm"
              disabled
            >
              <option>Email Only</option>
              <option>All</option>
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
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-8">
          Data Backup
        </h2>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            Backup Frequency
          </label>
          <div className="relative">
            <select
              title="period"
              className="w-full lg:w-1/2 border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent appearance-none text-sm"
              disabled
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

  const renderMessages = () => (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-64 bg-white border-r">
        <h2 className="p-4 font-bold">Messages</h2>
        <ul>
          {conversations.map((conv) => {
            const conversationId = conv.conversation_id || conv.id;
            const isUnread = unreadConversations.has(
              conversationId?.toString()
            );
            const isSelected =
              selectedConversation &&
              (conv.conversation_id || conv.id) ===
                (selectedConversation.conversation_id ||
                  selectedConversation.id);

            return (
              <li
                key={conversationId}
                className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                  isSelected ? "bg-gray-200" : ""
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
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`${isUnread ? "font-bold" : ""}`}>
                    {conv.group_name || conv.other_user_name || "Admin"}
                  </span>
                  {isUnread && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Chat area */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatMessages
            profile={profile}
            conversationId={
              selectedConversation.conversation_id || selectedConversation.id
            }
            recipientId={
              selectedConversation.group_name
                ? selectedConversation.group_name
                : selectedConversation.receiver_id === profile.id
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
          <div className="p-8 text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "schools":
        return renderSchools();
      case "reports":
        return renderReports();
      case "messages":
        return profileLoading ? (
          <div className="text-center text-gray-500">Loading profile...</div>
        ) : profileError ? (
          <div className="text-center text-red-500">{profileError}</div>
        ) : (
          renderMessages()
        );
      case "notifications":
        return renderNotifications();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1B365D] text-white flex flex-col transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 md:p-6 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold">Iqs Authority</h1>
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
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Iqs Authority</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
        {/* Desktop Header with Sign Out */}
        <div className="hidden md:flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Iqs Authority</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="p-4 md:p-6">{renderContent()}</div>
      </div>

      {/* View Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  View Report
                </h2>
                <button
                  title="Close"
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    School Name
                  </label>
                  <p className="text-sm md:text-base text-gray-900">
                    {selectedReport.school_name}
                  </p>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Visit Date
                  </label>
                  <p className="text-sm md:text-base text-gray-900">
                    {new Date(selectedReport.visit_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <p className="text-sm md:text-base text-gray-900">
                    {new Date(selectedReport.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Report ID
                  </label>
                  <p className="text-sm md:text-base text-gray-900">
                    {selectedReport.id}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-3">
                  Report Document
                </label>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                    <FileIcon size={48} className="text-gray-400 mb-2" />
                    <p className="text-xs md:text-sm text-gray-700 text-center">
                      {selectedReport.report_path
                        ? selectedReport.report_path.split("/").pop() ||
                          "Report Document"
                        : "Report Document"}
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {selectedReport.report_path
                        ? "File available for download"
                        : "No file attached"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  className="bg-[#1B365D] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors text-sm md:text-base w-full md:w-auto"
                  onClick={() => {
                    if (selectedReport.report_path) {
                      handleDownloadReport(selectedReport.id);
                    }
                  }}
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Report Modal */}
      {showAddReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  Add New Report
                </h2>
                <button
                  title="Close"
                  onClick={() => setShowAddReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    School Name
                  </label>
                  <select
                    title="school"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                    value={uploadForm.school_id}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        school_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Choose school Name</option>
                    {assignedSchools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    value={uploadForm.visit_date}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        visit_date: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Document
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
                  <input
                    type="file"
                    onChange={handleUploadFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="upload-file-input"
                  />
                  <label htmlFor="upload-file-input" className="cursor-pointer">
                    <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
                      {uploadFile
                        ? uploadFile.name
                        : "Click to upload report document"}
                    </p>
                    {uploadFile && (
                      <p className="text-xs text-gray-400 mt-1">
                        File selected: {uploadFile.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              {uploadError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {uploadError}
                </div>
              )}

              <div className="flex justify-start">
                <button
                  onClick={handleUploadReport}
                  disabled={uploadLoading}
                  className="bg-[#1B365D] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors text-sm md:text-base w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? "Uploading..." : "Upload Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add School Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  Add School FeedBack
                </h2>
                <button
                  title="Close"
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {feedbackError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {feedbackError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Feedback Rating *
                  </label>
                  <select
                    value={feedbackForm.rating}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        rating: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                  >
                    <option value="">Choose rating</option>
                    <option value="4">Excellent</option>
                    <option value="3">Good</option>
                    <option value="2">Average</option>
                    <option value="1">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Feedback Type *
                  </label>
                  <select
                    value={feedbackForm.type}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                  >
                    <option value="">Choose Feedback Type</option>
                    <option value="Academic Performance">
                      Academic Performance
                    </option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Staff Quality">Staff Quality</option>
                    <option value="Student Behavior">Student Behavior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={feedbackForm.description}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Feedback Description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Supporting Document (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="feedback-file-input"
                  />
                  <label
                    htmlFor="feedback-file-input"
                    className="cursor-pointer"
                  >
                    <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
                      {feedbackFile
                        ? feedbackFile.name
                        : "Click to upload supporting document"}
                    </p>
                    {feedbackFile && (
                      <p className="text-xs text-gray-400 mt-1">
                        File selected: {feedbackFile.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={feedbackLoading}
                  className="bg-[#1B365D] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors text-sm md:text-base w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {feedbackLoading ? "Submitting..." : "Send Feedback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluatorDashboard;
