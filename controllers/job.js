const User = require('../models/User'); const Job = require("../models/Job");

exports.deleteJob = async (req, res) => { try { const deletedJob = await Job.findByIdAndDelete(req.params.id); if (!deletedJob) return res.status(404).json({ message: "Job not found" }); res.json({ message: "Job deleted" }); } catch (err) { res.status(500).json({ message: "Delete failed", error: err.message }); } };

 exports.updateJob = async (req, res) => { try { const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!updatedJob) return res.status(404).json({ message: "Job not found" }); res.json(updatedJob); } catch (err) { res.status(400).json({ message: "Update failed", error: err.message }); } };

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