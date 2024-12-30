import jwt from "jsonwebtoken";
export function()  {
jwt.sign(
  {
    data: "foobar",
  },
  "secret",
  { expiresIn: "15m" }
);
} 
