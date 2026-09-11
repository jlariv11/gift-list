import express from "express"
import itemRoutes from "./routes/ItemRoutes";
import listRoutes from "./routes/ListRoutes";
import cors from "cors"
const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use("/api/items", itemRoutes);
app.use("/api/lists", listRoutes);

app.get("/health", async (req, res) => {
    res.status(200).send("Odsdsd");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})