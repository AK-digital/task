import mongoose from "mongoose";

mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bjbne.mongodb.net/`
    )
    .then(() => console.log("Connection to the DB etablished"))
    .catch((err) => console.log(err));