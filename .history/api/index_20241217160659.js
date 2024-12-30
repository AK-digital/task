import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "./config/db.js"
import router from "./routes/auth.routes.js";
// import * as authRouter from ""

const app = express();

app.use("/api/auth", authRouter)

app.listen(process.env.PORT || 4000, (err) => {
    console.log(process.env.PORT);
    if (err) {
        console.log(err);
    } else {
        console.log(`server is listening on port ${process.env.PORT}`);
    }
});