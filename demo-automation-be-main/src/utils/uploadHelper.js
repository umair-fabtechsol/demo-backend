const multer = require("multer");
const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const fs = require("fs");
const catchAsync = require("./catchAsync");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID1,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1,
});

// const uploadMulter = multer({
//   storage: multer.diskStorage({}),
//   limits: { fieldSize: 100 * 1024 * 1024 },
// });

const uploadMulter = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
});

const bufferUploadToCloud = async (file) => {
  // The params object is where you configure the upload
  const params = {
    Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer, // Here you can use the buffer directly
  };
  const result = await s3.upload(params).promise();
  return result.Location;
};

const uploadJson = async (jsonBuffer, fileName) => {
  console.log(`UPLOAD JSON IS CALLING, ${jsonBuffer}`);

  const result = await uploadToCloud(jsonBuffer, fileName);

  console.log(`UPLOADJSON ${result.url}`);
  return result;
};

const uploadToCloud = async (file, myFile) => {
  let folderName = process.env.PROJECT || "uploads";
  let params;

  if (Buffer.isBuffer(file)) {
    // If the input is a buffer
    console.log("File is a buffer, uploading to cloud.");
    const fileName = myFile || `${folderName}/${Date.now()}-buffer-file.json`;

    params = {
      Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: "application/json", // Set Content-Type for JSON buffer
    };
  } else if (file?.path && file?.mimetype) {
    // If the input is a file object
    console.log("File is a file object, uploading to cloud.");
    const fileStream = fs.createReadStream(file.path);

    // Check if file already exists in the bucket
    const fileExists = await s3
      .headObject({
        Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
        Key: myFile || `${folderName}/${file.originalname}`,
      })
      .promise()
      .then(() => true)
      .catch(() => false);

    // Add a timestamp or unique identifier to the filename if it already exists
    const fileName = fileExists
      ? `${folderName}/${Date.now()}-${file.originalname}`
      : `${folderName}/${file.originalname}`;

    params = {
      Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
      Key: fileName,
      Body: fileStream,
      ContentType: file.mimetype,
    };
  } else {
    throw new Error("Invalid file input. Must be a buffer or a file object.");
  }

  // Upload to S3
  try {
    const result = await s3.upload(params).promise();
    console.log("Upload successful:", result);

    //return { url: result.Location, type: params.ContentType };
    return { url: result.Location, mediaKey: result.Key };
  } catch (error) {
    console.error("Error uploading to cloud:", error);
    throw error;
  }
};

const uploadHandler = catchAsync(async (req, res, next) => {
  if (req.files) {
    if (req.files.length === 1) {
      const result = await uploadToCloud(req.files[0]);
      req.body[req.files[0].fieldname] = [result];
    } else if (req.files.length > 1) {
      const results = [];
      for (let file of req.files) {
        const result = await uploadToCloud(file);
        results.push(result);
      }

      req.body[req.files[0].fieldname] = results;
    }
  } else if (req.file) {
    const { fieldname } = req.file;
    const result = await uploadToCloud(req.file);
    req.body[fieldname] = result;
  }
  req.body;
  next();
});
module.exports = {
  uploadMulter,
  uploadToCloud,
  uploadHandler,
  uploadJson,
  bufferUploadToCloud,
};
