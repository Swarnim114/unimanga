import express from 'express';
import connectDB from './config/dbConfig.js';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.routes.js";


dotenv.config()
const app = express();
app.use(express.json());
connectDB()


app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.listen(3000, () => {
    console.log("server Started")
})