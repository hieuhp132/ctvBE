const express = require("express");
const router = express.Router();
const supabaseCtrl = require("../controllers/supabase");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
router.post("/upload", upload.single("file"), supabaseCtrl.uploadFile);

// Other routes
router.get("/download/:filename", supabaseCtrl.downloadFile);
router.delete("/delete/:filename", supabaseCtrl.deleteFile);
router.get("/list", supabaseCtrl.listFiles);

module.exports = router;
