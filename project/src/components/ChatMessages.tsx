import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessagesProps {
  profile: { id: string; name: string; email: string; role: string };
  conversationId: number; // Add this prop
  recipientId?: string; // default to 'admin' if not provided
  conversationType?: "group" | "user"; // Add this prop to explicitly specify type
  onNewMessage?: (data: any) => void; // Callback for new messages
  isSelected?: boolean; // Whether this conversation is currently selected
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  profile,
  conversationId,
  recipientId = "admin",
  conversationType, // Add this prop
  onNewMessage,
  isSelected = false,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessages, setNewMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper: check if message is sent by current user
  const isSentByMe = (msg: any) => msg.sender_id === profile.id;

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Auto-scroll when messages are first loaded or when new messages arrive
  useEffect(() => {
    if (messages.length > 0 || newMessages.length > 0) {
      scrollToBottom();
    }
  }, [messages, newMessages]);

  // Fetch all messages for the conversation
  useEffect(() => {
    const fetchMessages = async () => {
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/messages/conversation/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data.messages || []);
        // Clear any previous real-time messages when switching conversations
        setNewMessages([]);
      } catch (err: any) {
        setMessagesError(err.message || "Error fetching messages");
      } finally {
        setMessagesLoading(false);
      }
    };
    if (profile.id && conversationId) fetchMessages();
  }, [profile.id, conversationId]);

  // Merge real-time messages when conversation changes
  useEffect(() => {
    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages]);
      setNewMessages([]);
    }
  }, [conversationId]);

  // Real-time messaging setup
  useEffect(() => {
    if (profile.id) {
      console.log("ChatMessages: Initializing socket for user:", profile.id);
      const s = io(import.meta.env.VITE_API_URL );

      s.on("connect", () => {
        console.log("ChatMessages: Socket connected, socket ID:", s.id);
        // Wait a bit for socket to be fully ready, then register
        setTimeout(() => {
          s.emit("register", profile.id);
          console.log(
            "ChatMessages: Emitted register event for user:",
            profile.id
          );
        }, 100);
      });

      s.on("connect_error", (error) => {
        console.error("ChatMessages: Socket connection error:", error);
      });

      s.on("receive-message", (data: any) => {
        console.log("ChatMessages: Received real-time message:", data);

        // Call the onNewMessage callback to handle conversation reordering and unread status
        if (onNewMessage) {
          onNewMessage(data);
        }

        // Only add to newMessages if it belongs to the current conversation
        if (
          data.conversationId &&
          data.conversationId.toString() === conversationId.toString()
        ) {
          console.log("ChatMessages: Adding message to current conversation");
          // Add timestamp and ensure sender information is available
          const messageWithTimestamp = {
            ...data,
            created_at: new Date().toISOString(),
            sender_name: data.sender_name || "Unknown",
          };
          setNewMessages((prev) => [...prev, messageWithTimestamp]);
        } else {
          console.log(
            "ChatMessages: Ignoring message for different conversation",
            {
              receivedConversationId: data.conversationId,
              currentConversationId: conversationId,
            }
          );
        }
      });

      setSocket(s);
      return () => {
        console.log("ChatMessages: Disconnecting socket");
        s.disconnect();
      };
    }
  }, [profile.id, conversationId]); // Added conversationId to dependency array

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    setSendLoading(true);
    setSendError(null);
    try {
      const token = localStorage.getItem("token");

      // Use explicit conversationType if provided, otherwise infer from recipientId
      let type;
      if (conversationType) {
        type = conversationType;
      } else {
        // Fallback to old logic
        const groupNames = ["trainers", "schools", "evaluators"];
        type = groupNames.includes(recipientId) ? "group" : "user";
      }

      console.log("ChatMessages: Sending message:", {
        recipient_id: recipientId,
        message: messageInput,
        type,
        conversationId,
        conversationType,
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipient_id: recipientId,
            message: messageInput,
            type,
          }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      console.log("ChatMessages: Message sent successfully");
      // Add the sent message to the messages list immediately for better UX
      const sentMessage = {
        sender_id: profile.id,
        sender_name: profile.name,
        message: messageInput,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, sentMessage]);
      setMessageInput("");
    } catch (err: any) {
      console.error("ChatMessages: Error sending message:", err);
      setSendError(err.message || "Error sending message");
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 flex flex-col h-[60vh] max-h-[60vh]">
      <h2 className="text-lg font-semibold mb-4">Messages</h2>
      <div className="flex-1 overflow-y-auto pr-2">
        {messagesLoading && <div>Loading messages...</div>}
        {messagesError && <div className="text-red-500">{messagesError}</div>}
        {messages.length === 0 && !messagesLoading && (
          <div className="text-gray-500">No messages found.</div>
        )}
        <ul className="space-y-2">
          {/* Combine and sort all messages chronologically */}
          {[...messages, ...newMessages]
            .sort((a, b) => {
              // Sort by timestamp - older messages first, newer messages last
              const aTime = a.created_at || new Date().toISOString();
              const bTime = b.created_at || new Date().toISOString();
              return new Date(aTime).getTime() - new Date(bTime).getTime();
            })
            .map((msg, idx) => {
              const isRealTime = newMessages.includes(msg);
              return (
                <li
                  key={msg.id || `realtime-${idx}`}
                  className={`flex ${
                    isSentByMe(msg) ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex ${
                      isSentByMe(msg) ? "flex-row-reverse" : "flex-row"
                    } items-end gap-2`}
                  >
                    {!isSentByMe(msg) && (
                      <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {msg.sender_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow text-sm break-words ${
                        isSentByMe(msg)
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <div>{msg.message}</div>
                      <div className="text-xs text-right mt-1 opacity-70">
                        {isRealTime
                          ? "Now"
                          : new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                      </div>
                    </div>
                    {isSentByMe(msg) && (
                      <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {profile.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          {/* Debug info - remove in production */}
          <div ref={messagesEndRef} />
        </ul>
      </div>
      {/* Only show input form for individual messages or if user is admin */}
      {(conversationType !== "group" || profile.role === "admin") && (
        <form
          className="mt-4 flex gap-2 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={sendLoading}
          />
          <button
            type="submit"
            className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={sendLoading || !messageInput.trim()}
          >
            {sendLoading ? "Sending..." : "Send"}
          </button>
        </form>
      )}
      {sendError && <div className="text-red-500 mt-2">{sendError}</div>}
    </div>
  );
};

export default ChatMessages;
