import express from 'express';
import cors from 'cors';
import connectDB from './config/dbConfig.js';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import mangaRoutes from "./routes/manga.routes.js";
import websiteRoutes from "./routes/website.routes.js";


dotenv.config()
const app = express();

// Enable CORS for all origins (for development)
app.use(cors());
app.use(express.json());
connectDB()


app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/manga", mangaRoutes);
app.use("/api/websites", websiteRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Server started on http://0.0.0.0:3000")
    console.log("Local network access: http://192.168.1.18:3000")
})
