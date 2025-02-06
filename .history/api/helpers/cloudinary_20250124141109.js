import cloudinary from "../config/cloudinary.js";

export async function destroyFile(folder, file) {
  try {
    const publicId = file.split("/")[9].split(".")[0];
    await cloudinary?.uploader?.destroy(`task/${folder}/${file}`);
  } catch (err) {
    throw err;
  }
}
