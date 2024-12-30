import jwt from "jsonwebtoken";
export function generateAccessToken(user) {
  jwt.sign(
    {
      uid: user?.id,
      role: user?.role,
    },
    "secret",
    { expiresIn: "15m" }
  );
}
