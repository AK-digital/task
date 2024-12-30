import jwt from "jsonwebtoken";
export function generateAccessToken(user) {
  jwt.sign(
    {
      user: {
        id: user?.id,
      },
    },
    "secret",
    { expiresIn: "15m" }
  );
}
