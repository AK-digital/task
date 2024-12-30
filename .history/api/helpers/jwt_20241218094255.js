import jwt from "jsonwebtoken";
export function generateAccessToken(user) {
  jwt.sign(
    {
      uid: user?.id,
      role: user?.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}
