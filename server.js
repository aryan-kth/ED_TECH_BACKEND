require("dotenv").config();
const express = require("express");
const app = express();
const dbConnect = require("./dbConnect/dbConnect");


dbConnect();

app.use(express.json());
app.use("/api/v1/user", require("./routes/user.routes"));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});