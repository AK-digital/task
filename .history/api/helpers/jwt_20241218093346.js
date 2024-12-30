import jwt from "jsonwebtoken";
export const accessToken = jwt.sign(
  {
    data: "foobar",
  },
  "secret",
  { expiresIn: 60 * 60 }
);
