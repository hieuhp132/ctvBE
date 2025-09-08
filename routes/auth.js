const express = require('express');
const router = express.Router();
const {getProfile, getAllJobs, getJobById, createJob, updateJob, deleteJob, login, updateBasicInfo} = require('../controllers/auth');
const authMiddleWare = require('../middlewares/auth');

router.get('/user/profile', authMiddleWare, getProfile);

// Route: /api/jobs
router.get("/user/jobs", authMiddleWare, getAllJobs);
router.get("/user/:id", authMiddleWare, getJobById);
router.post("/user/create", authMiddleWare, createJob);
router.put("/user/:id", authMiddleWare, updateJob);
router.delete("/user/:id", authMiddleWare, deleteJob);
router.put('/user/updateBasicInfo', authMiddleWare, updateBasicInfo);


module.exports = router;
