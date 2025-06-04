import { client } from "@/config/db";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    modelName: "users",
    fields: {
      image: "picture",
    },
  },
});
