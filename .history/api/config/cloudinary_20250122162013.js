import { v2 as cloudinary } from "cloudinary";

console.log("hey");
// Configuration
export default cloudinary.config({
  cloud_name: `${process.env.CLOUDINAR}`,
  api_key: `${process.env.APIKEY}`,
  api_secret: `${process.env.APISECRETKEY}`,
});
