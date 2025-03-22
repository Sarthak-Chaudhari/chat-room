const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",  // Allow all origins for testing
        methods: ["GET", "POST"]
    }
});

app.use(cors());

// Store active users
let users = {};

// Handle user connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User joins room
    socket.on("joinRoom", ({ room, username }) => {
        socket.join(room);
        users[socket.id] = { username, room };

        // Broadcast user joined
        io.to(room).emit("userJoined", { username, count: Object.keys(users).length });
        console.log(`${username} joined ${room}`);
    });
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let roomId = urlParams.get('room'); 
    
    if (!roomId) {
        roomId = 'default-room'; // Default room if no room ID is provided
    }
    
    // Connect to Socket.io and join the room
    const socket = io("http://localhost:3000");  // Update with your backend server URL
    
    socket.emit("joinRoom", { room: roomId, username: displayName });
    
    socket.on("userJoined", (data) => {
        console.log(`${data.username} joined ${roomId}`);
    });
    
    // Handle sending messages
    socket.on("sendMessage", ({ room, username, message }) => {
        io.to(room).emit("receiveMessage", { username, message });
    });


    // User disconnects
    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            io.to(user.room).emit("userLeft", { username: user.username, count: Object.keys(users).length - 1 });
            console.log(`${user.username} left ${user.room}`);
            delete users[socket.id];
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Socket.io Server running on port ${PORT}`);
});
