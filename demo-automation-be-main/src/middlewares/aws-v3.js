  require("dotenv").config();
  const {
    PutObjectCommand,
    S3Client,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    ListPartsCommand,
  } = require("@aws-sdk/client-s3");
  const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
  const sharp = require("sharp");
  const multer = require("multer");
  // const heicConvert = require("heic-convert");

  // const fs = require("fs");
  // const path = require('path');
  // const { execFile } = require('child_process');

  const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID1,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1,
    },
  });

  const bucketName = process.env.AWS_STORAGE_BUCKET_NAME;
  const AWS_Region = process.env.REGION;

  const upload = multer();

  const initiateMultipartUpload = async (fileName, fileType) => {
    const command = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: fileType,
      ACL: "public-read",
    });
    const response = await s3Client.send(command);
    return { UploadId: response.UploadId };
  };

  const createPresignedUrl = async (fileName, uploadId, partNumber, filetype) => {
    // //console.log(fileName)
    const command = new UploadPartCommand({
      Bucket: bucketName,
      Key: fileName,
      UploadId: uploadId,
      PartNumber: partNumber,
      ContentType: filetype,
      ACL: "public-read",
      Expires: 3600, // 1 hour
    });
    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
      return url;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  /**
   * Upload part to S3
   */
  const uploadPart = async (index, fileName, fileBuffer, uploadId, fileType) => {
    const command = new UploadPartCommand({
      Bucket: bucketName,
      Key: fileName,
      UploadId: uploadId,
      PartNumber: Number(index) + 1,
      Body: fileBuffer,
      ContentType: fileType,
      ACL: "public-read",
    });
    return s3Client.send(command);
  };

  const completeMultipartUpload = async (
    filename,
    uploadId,
    width = 150,
    height = 150
  ) => {
    console.log("aya ma complete upload");

    const command = new ListPartsCommand({
      Bucket: bucketName,
      Key: filename,
      UploadId: uploadId,
      ACL: "public-read",
    });
    // const tempDir = path.join(__dirname, '..', 'temp');

    try {
      const data = await s3Client.send(command);
      console.log(data);
      if (!data) {
        throw new Error("data not provided for completing multipart upload.");
      }
      const parts = data?.Parts?.map((part) => ({
        ETag: part.ETag,
        PartNumber: part.PartNumber,
      }));

      if (!parts || parts.length === 0) {
        throw new Error("No parts provided for completing multipart upload.");
      }
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: filename,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      });

      const response = await s3Client.send(completeCommand);

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
    // finally{
    //   cleanUpFiles(tempDir);

    // }
  };

  const generateDownloadUrl = async (key) => {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ACL: "public-read",
    });
    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
  };

  const mediaDeleteS3 = async function (filename) {
    const params = {
      Bucket: bucketName,
      Key: filename,
    };
    try {
      const deleteCommand = new DeleteObjectCommand(params);
      return (deleteResult = await s3Client.send(deleteCommand));
      // //console.log(deleteResult)
      //console.log(`File deleted successfully: ${filename}`);
    } catch (err) {
      console.error(`Error deleting file: ${filename}`, err);
      throw err; // Re-throw the error for handling
    }
  };

  module.exports = {
    initiateMultipartUpload,
    createPresignedUrl,
    uploadPart,
    completeMultipartUpload,
    generateDownloadUrl,
    mediaDeleteS3,
    upload,
  };
