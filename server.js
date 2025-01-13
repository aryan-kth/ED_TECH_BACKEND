require("dotenv").config();
const express = require("express");
const app = express();
const dbConnect = require("./dbConnect/dbConnect");
const cors = require("cors");

dbConnect();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api/v1/user", require("./routes/user.routes"));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});