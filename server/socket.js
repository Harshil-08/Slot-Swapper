import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const connectedUsers = new Map();
let io;

export const handleWebsocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: ["http://localhost:5173", "http://localhost:3000"],
			credentials: true,
		},
	});

	io.use((socket, next) => {
		const token = socket.handshake.auth.token;

		if (!token) return next(new Error("Authentication error"));

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			socket.userId = decoded.id;
			next();
		} catch (err) {
			next(new Error("Invalid token"));
		}
	});

	io.on("connection", (socket) => {
		console.log(`✅ User connected: ${socket.userId}`);
		connectedUsers.set(socket.userId, socket.id);

		socket.on("disconnect", () => {
			console.log(`❌ User disconnected: ${socket.userId}`);
			connectedUsers.delete(socket.userId);
		});
	});
};

export const emitToUser = (userId, event, data) => {
	const socketId = connectedUsers.get(userId.toString());
	if (socketId) {
		io.to(socketId).emit(event, data);
	}
};
