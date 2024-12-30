import mongoose from "mongoose";

mongoose
    .connect(
        `mongodb+srv://${process.env.U}:${process.env.PASSWORD}@${process.env.CLUSTER}.pmgevya.mongodb.net/`
    )
    .then(() => console.log("Connection to the DB etablished"))
    .catch((err) => console.log(err));