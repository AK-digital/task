import jwt from "jsonwebtoken";
export function generateAccessToken(user) {
  return jwt.sign(
    {
      uid: user?.id,
      role: user?.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      uid: user?.id,
      role: user?.role,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "1d" }
  );
}
