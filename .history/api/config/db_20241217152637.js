import mongoose from "mongoose";

mongoose
    .connect(
        `mongodb+srv://nicolastombal:<db_password>@cluster0.bjbne.mongodb.net/`
    )
    .then(() => console.log("Connection to the DB etablished"))
    .catch((err) => console.log(err));