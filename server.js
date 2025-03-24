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

const cors = require("cors");

app.use(cors({
    origin: ["https://sarthak-chaudhari.github.io/chat-room", "https://chat-room-zeta-six.vercel.app"],  
    methods: ["GET", "POST"]
}));



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

    // Handle sending messages
    socket.on("sendMessage", ({ room, username, message }) => {
        io.to(room).emit("receiveMessage", { username, message });
    });

    // User disconnects
       // User disconnects
socket.on("disconnect", () => {
    const user = users[socket.id]; 
    if (user) {
        const { room, username } = user;
        delete users[socket.id]; // Remove user from the users list

        // Emit updated user list and count only for the affected room
        const usersInRoom = Object.values(users).filter(u => u.room === room);
        io.to(room).emit("userLeft", { username, count: usersInRoom.length });
        console.log(`${username} left ${room}`);
    }
});

// User manually leaves room
socket.on("leaveRoom", ({ room, username }) => {
    if (users[socket.id]) {
        delete users[socket.id]; // Remove user from the users list

        // Emit updated user list and count only for the affected room
        const usersInRoom = Object.values(users).filter(u => u.room === room);
        io.to(room).emit("userLeft", { username, count: usersInRoom.length });
        console.log(`${username} left ${room}`);
    }
    socket.leave(room); // Ensure the user leaves the room
});

    
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Socket.io Server running on port ${PORT}`);
});
