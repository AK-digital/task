import jwt from "jsonwebtoken";
export function accessToken() {
  jwt.sign(
    {
      data: "foobar",
    },
    "secret",
    { expiresIn: "15m" }
  );
}
