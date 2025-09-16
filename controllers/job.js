const User = require('../models/User'); const Job = require("../models/Job");

// Save job for user
exports.saveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    console.log("Fetching job with ID:", jobId);
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    console.log("Job before update:", job);
    console.log("Checking if userId exists in savedBy:", userId, job.savedBy);
    if (!job.savedBy.includes(userId)) {
      job.savedBy.push(userId);
      console.log("UserId added to savedBy:", userId);
    } else {
      console.log("UserId already exists in savedBy:", userId);
    }

    await job.save();
    console.log("Job after update:", job);

    res.json({ success: true, job });
  } catch (err) {
    console.error("Error in saveJob:", err);
    res.status(400).json({ message: "Save job failed", error: err.message });
  }
};

exports.deleteJob = async (req, res) => { try { const deletedJob = await Job.findByIdAndDelete(req.params.id); if (!deletedJob) return res.status(404).json({ message: "Job not found" }); res.json({ message: "Job deleted" }); } catch (err) { res.status(500).json({ message: "Delete failed", error: err.message }); } };
exports.updateJob = async (req, res) => { try { const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!updatedJob) return res.status(404).json({ message: "Job not found" }); res.json(updatedJob); } catch (err) { res.status(400).json({ message: "Update failed", error: err.message }); } };

 exports.createJob = async (req, res) => { try { const newJob = await Job.create(req.body); res.status(201).json(newJob); } catch (err) { res.status(400).json({ message: "Invalid data", error: err.message }); } };

 exports.getJobById = async (req, res) => { try { const job = await Job.findById(req.params.id); if (!job) return res.status(404).json({ message: "Job not found" }); res.json(job); } catch (err) { res.status(500).json({ message: "Server error" }); } };
 exports.getAllJobs = async (req, res) => { 
  try { 
    const { page = 1, limit = 50, q = "", savedBy } = req.query;
    const query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }
    if (savedBy) {
      query.savedBy = savedBy;
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

exports.unsaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    job.savedBy = job.savedBy.filter(id => id !== userId);
    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    res.status(400).json({ message: "Unsave job failed", error: err.message });
  }
};

exports.resetJobs = async (req, res) => {
  try {
    await Job.deleteMany({});
    res.status(200).json({ message: "All jobs have been reset." });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset jobs", error: err.message });
  }
};

exports.updateJobJD = async (req, res) => {
  try {
    const {id} = req.params;
    const jdLink = typeof req.body.jdLink === 'string' ? req.body.jdLink : undefined;
    const jdFileName = req.file ? req.file.filename : undefined;
    const clearFile = req.body.clearFile === 'true';
    const update = {};
    if(jdLink !== undefined) update.jdLink = jdLink;
    if(jdFileName !== undefined) update.jdFileName = jdFileName;
    if(clearFile) update.jdFileName = '';

    if(jdFileName && jdLink === undefined) update.jdLink = jdFileName;
    const job = await Job.findByIdAndUpdate(id, update, { new: true });
    if(!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: "Update JD failed", error: err.message });
  }
};
