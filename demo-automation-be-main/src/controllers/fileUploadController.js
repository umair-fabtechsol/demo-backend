const {
  initiateMultipartUpload,
  createPresignedUrl,
  uploadPart,
  completeMultipartUpload,
  generateDownloadUrl,
} = require("../middlewares/aws-v3");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const generatePresignedUrl = catchAsync(async (req, res, next) => {
  const { fileName, partNumber, uploadId, filetype } = req.body;
  console.log("generatePresignedUrl");

  if (!fileName || !filetype) {
    return next(new AppError("File name and file type are required.", 400));
  }

  const url = await createPresignedUrl(
    fileName,
    uploadId,
    partNumber,
    filetype
  );
  res.status(200).json({ success: true, url });
});

const initiateUpload = catchAsync(async (req, res, next) => {
  const { fileName, filetype } = req.body;

  // console.log("I AM HERE", fileName, filetype);
  if (!fileName || !filetype) {
    return next(new AppError("File name and file type are required.", 400));
  }

  const response = await initiateMultipartUpload(fileName, filetype);
  res.status(200).json({ success: true, response });
});

const uploadChunk = catchAsync(async (req, res, next) => {
  // console.log("uploadChunk");

  const { index, fileName, filetype } = req.body;
  const uploadId = req.query.uploadId;
  const file = req.file;
  // console.log("file", file);
  if (!index || !fileName || !uploadId || !file) {
    return next(new AppError("Missing required parameters.", 400));
  }

  const response = await uploadPart(
    index,
    fileName,
    file.buffer,
    uploadId,
    filetype
  );
  res.status(200).json({
    success: true,
    message: "Chunk uploaded successfully",
    data: response,
  });
});

const completeUpload = catchAsync(async (req, res, next) => {
  // const { fileName, uploadId, width, height } = req.body;
  const { fileName, uploadId } = req.body;
  // console.log("compl;ete upload");
  if (!fileName || !uploadId) {
    return next(new AppError("File name and upload ID are required.", 400));
  }

  const response = await completeMultipartUpload(
    fileName,
    uploadId
  );
  res.status(200).json({
    success: true,
    message: "Upload completed successfully",
    data: response,
  });
});

const downloadAwsObject = catchAsync(async (req, res, next) => {
  const { key } = req.body;

  if (!key) {
    return next(new AppError("File key is required.", 400));
  }

  const url = await generateDownloadUrl(key);
  res.status(200).json({ success: true, url });
});

module.exports = {
  generatePresignedUrl,
  initiateUpload,
  uploadChunk,
  completeUpload,
  downloadAwsObject,
};
