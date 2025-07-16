const { io } = require("socket.io-client");

// Replace with your backend URL and user ID
const socket = io("http://localhost:5000");
const userId = "2"; // The user ID you want to test as

socket.on("connect", () => {
  console.log("Connected as user", userId);
  socket.emit("register", userId);
});

socket.on("receive-message", (data) => {
  console.log("Received message:", data);
});