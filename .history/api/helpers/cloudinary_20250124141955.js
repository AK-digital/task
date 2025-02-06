import cloudinary from "../config/cloudinary.js";

export async function uploadFile(path, buffer) {
  try {
    const options = {
      folder: path,
      upload_preset: "task_preset",
    };
  } catch (err) {
    throw err;
  }
}

export async function destroyFile(folder, file) {
  try {
    const publicId = file.split("/")[9].split(".")[0]; // Retrives the public id of the img
    await cloudinary?.uploader?.destroy(`task/${folder}/${publicId}`);
  } catch (err) {
    throw err;
  }
}
