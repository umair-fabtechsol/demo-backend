const express = require("express");
const {
  generatePresignedUrl,
  initiateUpload,
  uploadChunk,
  completeUpload,
  downloadAwsObject,
} = require("../controllers/fileUploadController");
const { upload } = require("./../middlewares/aws-v3");

const router = express.Router();

// Define routes for file upload functionality
router.post("/initiate-upload", initiateUpload);

router.post("/generate-presigned-url", generatePresignedUrl);
// router.post("/upload-chunk",upload.single("file"), uploadChunk);
router.post("/complete-upload", completeUpload);
// router.post("/download-object", downloadAwsObject);

module.exports = router;
