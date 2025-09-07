const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const jobCtrl = require("../controllers/job");

// Admin CRUD Job
router.post("/", auth, role(["admin"]), jobCtrl.createJob);
router.put("/:id", auth, role(["admin"]), jobCtrl.updateJob);
// Save job for user (admin/recruiter)
router.put("/:id/save", auth, jobCtrl.saveJob);
router.put("/:id/unsave", auth, jobCtrl.unsaveJob);
// Update JD (admin or recruiter can upload; restrict to auth)
router.put("/:id/jd", auth, jobCtrl.uploadJD, jobCtrl.updateJobJD);
router.delete("/:id", auth, role(["admin"]), jobCtrl.deleteJob);
router.delete("/reset", async (req, res) => {
  try {
    await Job.deleteMany({});
    res.status(200).json({ message: "All jobs have been reset." });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset jobs", error: err.message });
  }
});

// Common
router.get("/", jobCtrl.getAllJobs);
router.get("/:id", jobCtrl.getJobById);

module.exports = router;
