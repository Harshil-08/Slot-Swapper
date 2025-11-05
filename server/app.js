import express from 'express';
import cors from "cors";
import mongoose from 'mongoose';
import 'dotenv/config';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: ["http://localhost:5173"],
		credentials: true,
	}),
);
app.use(cookieParser());

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/client/dist")));
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

server.listen(PORT, () => {
	try {
		mongoose.connect(DB_URI);
		console.log("Database connected successfully!");
	} catch (error) {
		console.log(`Error connecting to server: ${error.message}`);
	}
	console.log(`Server listening on port ${PORT}`);
});

