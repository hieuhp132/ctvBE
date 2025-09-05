const User = require('../models/User'); const Job = require("../models/Job");

exports.deleteJob = async (req, res) => { try { const deletedJob = await Job.findByIdAndDelete(req.params.id); if (!deletedJob) return res.status(404).json({ message: "Job not found" }); res.json({ message: "Job deleted" }); } catch (err) { res.status(500).json({ message: "Delete failed", error: err.message }); } };

 exports.updateJob = async (req, res) => { try { const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!updatedJob) return res.status(404).json({ message: "Job not found" }); res.json(updatedJob); } catch (err) { res.status(400).json({ message: "Update failed", error: err.message }); } };

// JD upload using multer
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function(req, file, cb) { cb(null, uploadDir); },
  filename: function(req, file, cb) {
    const unique = Date.now() + '_' + Math.round(Math.random()*1e9);
    const ext = path.extname(file.originalname);
    cb(null, `jd_${unique}${ext}`);
  }
});
exports.uploadJD = multer({ storage }).single('jd');

exports.updateJobJD = async (req, res) => {
  try {
    const { id } = req.params;
    const jdLink = req.body.jdLink || '';
    const jdFileName = req.file ? req.file.filename : undefined;
    const update = {};
    if (typeof jdLink === 'string') update.jdLink = jdLink;
    if (jdFileName) update.jdFileName = jdFileName;
    const job = await Job.findByIdAndUpdate(id, update, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update JD', error: err.message });
  }
};

 exports.createJob = async (req, res) => { try { const newJob = await Job.create(req.body); res.status(201).json(newJob); } catch (err) { res.status(400).json({ message: "Invalid data", error: err.message }); } };

 exports.getJobById = async (req, res) => { try { const job = await Job.findById(req.params.id); if (!job) return res.status(404).json({ message: "Job not found" }); res.json(job); } catch (err) { res.status(500).json({ message: "Server error" }); } };
 exports.getAllJobs = async (req, res) => { 
  try { 
    const { page = 1, limit = 50, q = "" } = req.query;
    const query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ items: jobs, total, page: Number(page), limit: Number(limit) });
  } catch (err) { 
    res.status(500).json({ message: "Server error" }); 
  } 
};