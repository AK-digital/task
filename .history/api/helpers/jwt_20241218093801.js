import jwt from "jsonwebtoken";
export function generateAccessToken(user) {
  jwt.sign(
    {
      userId: user?.id,
    },
    "secret",
    { expiresIn: "15m" }
  );
}
