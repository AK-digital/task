import jwt from "jsonwebtoken";
export function accessToken(user) {
  jwt.sign(
    {
      data: "foobar",
    },
    "secret",
    { expiresIn: "15m" }
  );
}
