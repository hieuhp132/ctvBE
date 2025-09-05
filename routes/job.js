const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const jobCtrl = require("../controllers/job");

// Admin CRUD Job
router.post("/", auth, role(["admin"]), jobCtrl.createJob);
router.put("/:id", auth, role(["admin"]), jobCtrl.updateJob);
router.delete("/:id", auth, role(["admin"]), jobCtrl.deleteJob);

// Common
router.get("/", jobCtrl.getAllJobs);
router.get("/:id", jobCtrl.getJobById);

module.exports = router;
