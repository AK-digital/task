import jwt from "jsonwebtoken";
export function generateAccessToken(user) {
  jwt.sign(
    {
      uid: user?.id,
    },
    "secret",
    { expiresIn: "15m" }
  );
}
