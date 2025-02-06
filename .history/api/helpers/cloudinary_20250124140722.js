import cloudinary from "../config/cloudinary.js";

export async function destroyFile(folder, file) {
  try {
    await cloudinary?.uploader?.destroy(`task/${folder}/${file}`);
  } catch (err) {
    throw err;
  }
}
