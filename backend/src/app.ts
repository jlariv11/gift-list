import express from "express";
import itemRoutes from "./routes/ItemRoutes";
import listRoutes from "./routes/ListRoutes";
import userRoutes from "./routes/UserRoutes";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
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