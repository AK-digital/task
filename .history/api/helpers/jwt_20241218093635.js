import jwt from "jsonwebtoken";
export function accessToken(user) {
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
