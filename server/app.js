import express from 'express';
import cors from "cors";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import path from "path";
import http from "http";

import authRouter from "./routes/auth.js";
import eventRouter from "./routes/event.js";
import swapRouter from "./routes/swap.js";
import { handleWebsocket } from "./socket.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
	cors({
		origin: ["http://localhost:5173", "http://localhost:3000"],
		credentials: true,
	}),
);

app.use('/api/auth', authRouter);
app.use('/api/events', eventRouter);
app.use('/api/swap', swapRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/client/dist")));
app.use(/.*/, (req, res) => {
	res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

handleWebsocket(server);

server.listen(PORT, async () => {
	try {
		await mongoose.connect(DB_URI);
		console.log("✅ Database connected successfully!");
	} catch (error) {
		console.log(`❌ Error connecting to database: ${error.message}`);
	}
	console.log(`🚀 Server listening on port ${PORT}`);
});
