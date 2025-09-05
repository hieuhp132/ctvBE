const Referral = require("../models/Referral");
const Job = require("../models/Job");
const User = require("../models/User");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, "..", "uploads");
    try {
      const fs = require("fs");
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
    } catch {}
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `cv_${Date.now()}_${Math.random().toString(36).slice(2,6)}${ext}`);
  },
});

exports.uploadCV = multer({ storage }).single("cv");

// Recruiter gửi referral (submit candidate)
exports.createReferral = async (req, res) => {
  try {
    let { jobId, adminId, candidateName, email, phone, linkedin, portfolio, suitability, bonus, message } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (new Date(job.deadline) < new Date())
      return res.status(400).json({ message: "Job is closed" });

    if (!adminId) {
      const adminUser = await User.findOne({ role: "admin" }).select("_id");
      if (!adminUser) return res.status(400).json({ message: "No admin available" });
      adminId = adminUser._id;
    }

    const referral = await Referral.create({
      recruiter: req.user.id,
      job: jobId,
      admin: adminId,
      candidateName,
      candidateEmail: email || "",
      candidatePhone: phone || "",
      cvFileName: req.file?.filename || "",
      linkedin: linkedin || "",
      portfolio: portfolio || "",
      suitability: suitability || "",
      bonus: typeof bonus === 'number' ? bonus : 0,
      message: message || "",
    });

    res.status(201).json(referral);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin xem referral gửi tới mình
exports.getReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, jobId, q = "" } = req.query;
    const filter = { admin: req.user.id };
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;
    if (q) filter.candidateName = { $regex: q, $options: 'i' };
    const total = await Referral.countDocuments(filter);
    const referrals = await Referral.find(filter)
      .populate("recruiter job")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ items: referrals, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Recruiter xem referral mình đã gửi
exports.getMyReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, jobId, q = "" } = req.query;
    const filter = { recruiter: req.user.id };
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;
    if (q) filter.candidateName = { $regex: q, $options: 'i' };
    const total = await Referral.countDocuments(filter);
    const referrals = await Referral.find(filter)
      .populate("job")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ items: referrals, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin cập nhật trạng thái/bonus referral
exports.updateReferralStatus = async (req, res) => {
  try {
    const { status, bonus } = req.body;
    const allowed = ["submitted", "interviewing", "offer", "hired", "rejected"];
    if (status && !allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ message: "Referral not found" });

    if (typeof bonus === 'number') referral.bonus = bonus;
    if (status) referral.status = status;
    await referral.save();

    // Adjust credits & emit notifications when hired/rejected
    try {
      const Notification = require("../models/Notification");
      if (status === 'hired') {
        await Notification.create({ role: 'recruiter', message: `Profile ${referral.candidateName} has been Hired. Bonus: ${referral.bonus}` });
        await Notification.create({ role: 'admin', message: `Bonus ${referral.bonus} paid to recruiter ${referral.recruiter}` });
        // Optionally, adjust admin credit here if persisted in DB
      } else if (status === 'rejected') {
        await Notification.create({ role: 'recruiter', message: `Profile ${referral.candidateName} has been Rejected` });
      }
    } catch {}

    res.json(referral);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
