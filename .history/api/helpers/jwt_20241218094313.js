import jwt from "jsonwebtoken";
export function generateAccessToken(user) {
  console.log("le secret de access", process.env.JWT_ACCESS_SECRET);
  jwt.sign(
    {
      uid: user?.id,
      role: user?.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}
