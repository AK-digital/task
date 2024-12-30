import express from "express"

const app = express()

app.listen(process.env.PORT || 4000, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`server is listening on port ${process.env.PORT}`);
    }
});