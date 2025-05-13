import cloudinary from "../config/cloudinary.js";

export async function uploadFileBuffer(path, buffer, originalFilename) {
  try {
    const fileExtension = originalFilename
      ? originalFilename.split(".").pop().toLowerCase()
      : "";

    let resourceType = "auto";

    if (
      [
        "csv",
        "txt",
        "json",
        "xml",
        "md",
        "rtf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
      ].includes(fileExtension)
    ) {
      resourceType = "raw";
    }

    const options = {
      folder: path,
      upload_preset: "task_preset",
      resource_type: resourceType,
    };

    return await new Promise((resolve, reject) => {
      cloudinary?.uploader
        ?.upload_stream(options, async (err, result) => {
          if (err) return reject(err);
          resolve(result);
        })
        .end(buffer);
    });
  } catch (err) {
    throw err;
  }
}

export async function uploadFile(path, img) {
  try {
    const options = {
      folder: path,
      upload_preset: "task_preset",
    };

    return await cloudinary.uploader.upload(img, options);
  } catch (err) {
    throw err;
  }
}

export async function destroyFile(folder, file) {
  try {
    const segments = file.split("/");
    const resourceType = segments[4]; // "image" ou "raw"
    const lastSegment = segments[9];

    let publicId;
    if (lastSegment.includes(".")) {
      publicId = lastSegment.split(".")[0];
    } else {
      publicId = lastSegment;
    }

    await cloudinary?.uploader?.destroy(`task/${folder}/${publicId}`, {
      resource_type: resourceType, // "image" ou "raw" selon le type
    });
    console.log(`File destroyed: task/${folder}/${publicId} (${resourceType})`);
  } catch (err) {
    console.error("Error destroying file:", err);
    throw err;
  }
}
