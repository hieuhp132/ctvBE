const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const jobCtrl = require("../controllers/job");

// Route /api/jobs

// Admin CRUD Job
router.post("/", auth, role(["admin"]), jobCtrl.createJob);
router.put("/:id", auth, role(["admin"]), jobCtrl.updateJob);
// Save job for user (admin/recruiter)
router.put("/:id/save", auth, jobCtrl.saveJob);
router.put("/:id/unsave", auth, jobCtrl.unsaveJob);
// Update JD (admin or recruiter can upload; restrict to auth)
router.delete("/:id", auth, role(["admin"]), jobCtrl.deleteJob);
// Common
router.get("/", jobCtrl.getAllJobs);
router.get("/:id", jobCtrl.getJobById);
router.delete("/reset", jobCtrl.resetJobs); // For testing purposes only});

module.exports = router;
