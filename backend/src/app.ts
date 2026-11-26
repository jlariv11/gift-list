import express from "express";
import itemRoutes from "./routes/ItemRoutes";
import listRoutes from "./routes/ListRoutes";
import userRoutes from "./routes/UserRoutes";
import cors from "cors";

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "https://www.giftlist.dev",
    "https://giftlist.dev",
]
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/items", itemRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/user", userRoutes);

app.get("/health", async (req, res) => {
    res.status(200).send("Health Check OK");
});

export default app;