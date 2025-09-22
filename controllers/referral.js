const Referral = require("../models/Referral");
const Job = require("../models/Job");
const User = require("../models/User");

exports.downloadCV = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral || !referral.cvKey) {
      return res.status(404).json({ message: "CV not found" });
    }

    const { data, error } = await supabase.storage
      .from("cvs")
      .download(referral.cvKey);

    if (error) {
      console.error("Supabase download error:", error.message);
      return res.status(500).json({ message: "Download failed", error: error.message });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${referral.cvFileName}"`);
    res.setHeader("Content-Type", data.type);
    res.send(Buffer.from(await data.arrayBuffer()));
  } catch (err) {
    console.error("Error in downloadCV:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Recruiter gửi referral (submit candidate)
exports.createReferral = async (req, res) => {
  try {
    let {
      jobId, adminId, candidateName, email,
      phone, linkedin, portfolio, suitability,
      bonus, message
    } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    /*
    if (new Date(job.deadline) < new Date())
      return res.status(400).json({ message: "Job is closed" });
    */
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
      cvFileName: req.cvInfo?.cvFileName || "",
      cvKey: req.cvInfo?.cvKey || "",
      cvUrl: req.cvInfo?.cvUrl || "",
      linkedin: linkedin || "",
      portfolio: portfolio || "",
      suitability: suitability || "",
      bonus: Number(bonus) || 0,
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
    const { page = 1, limit = 50, status, jobId, q = "", finalized } = req.query;
    const filter = { admin: req.user.id };

    if (status) filter.status = status;
    if (jobId) filter.job = jobId;
    if (q) filter.candidateName = { $regex: q, $options: 'i' };
    if (req.query.recruiterId) {
      filter.recruiter = req.query.recruiterId;
    }

    if (finalized === "true") filter.finalized = true;
    else if (finalized === "false") filter.finalized = { $ne: true };


    const total = await Referral.countDocuments(filter);
    const referrals = await Referral.find(filter)
      .populate("recruiter job")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const allReferrals = await Referral.find();


    res.json({ items: referrals, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// Recruiter xem referral mình đã gửi
exports.getMyReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, jobId, q = "", finalized } = req.query;
    const filter = { recruiter: req.user.id };

    if (status) filter.status = status;
    if (jobId) filter.job = jobId;
    if (q) filter.candidateName = { $regex: q, $options: 'i' };

    if (finalized === "true") filter.finalized = true;
    else if (finalized === "false") filter.finalized = { $ne: true };

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
    const allowed = ["submitted", "interviewing", "offer", "hired", "onboard", "rejected"];
    if (status && !allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ message: "Referral not found" });

    if (typeof bonus === 'number') referral.bonus = bonus;
    if (status) referral.status = status;
    await referral.save();

    // Adjust credits & emit notifications when hired/rejected
   /*
    try {
      //const Notification = require("../models/Notification");
      if (status === 'hired') {
        //await Notification.create({ role: 'recruiter', message: `Profile ${referral.candidateName} has been Hired. Bonus: ${referral.bonus}` });
        //await Notification.create({ role: 'admin', message: `Bonus ${referral.bonus} paid to recruiter ${referral.recruiter}` });
        // Adjust admin and recruiter credits in DB
        const admin = await User.findOne({ role: "admin" });
        if (admin) {
          admin.credit = Math.max(0, (admin.credit || 0) - (referral.bonus || 0));
          await admin.save();
        }
        const recruiter = await User.findById(referral.recruiter);
        if (recruiter) {
          recruiter.credit = (recruiter.credit || 0) + (referral.bonus || 0);
          await recruiter.save();
        }
      } else if (status === 'rejected') {
        await Notification.create({ role: 'recruiter', message: `Profile ${referral.candidateName} has been Rejected` });
      }
    } catch {}
   */

    // Send email notifications to all related parties
    /*const { sendApplicationStatusUpdate } = require('../utils/email');
    try {
      const admin = await User.findById(referral.admin);
      const recruiter = await User.findById(referral.recruiter);

      if (admin) {
        await sendApplicationStatusUpdate(referral.candidateName, admin.email, referral.job);
      }
      if (recruiter) {
        await sendApplicationStatusUpdate(referral.candidateName, recruiter.email, referral.job);
      }
      if (referral.candidateEmail) {
        await sendApplicationStatusUpdate(referral.candidateName, referral.candidateEmail, referral.job);
      }
    } catch (emailError) {
    }*/

    res.json(referral);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.finalizeReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }
    if (referral.admin.toString() !== adminId) {
        return res.status(403).json({ message: "Not authorized to finalize this referral" });
    }
    if (referral.finalized) {
      return res.status(400).json({ message: "Referral already finalized" });
    }

    // If status is Onboard, process payment
    if (referral.status === "Onboard") {
      const bonusAmount = referral.bonus;
      if (bonusAmount > 0) {
        const admin = await User.findById(adminId);
        const recruiter = await User.findById(referral.recruiter);

        if (!admin || !recruiter) {
          return res.status(404).json({ message: "Admin or Recruiter not found" });
        }

        if (admin.credit < bonusAmount) {
          return res.status(400).json({ message: "Insufficient admin credit" });
        }

        admin.credit -= bonusAmount;
        recruiter.credit += bonusAmount;

        await admin.save();
        await recruiter.save();
      }
    }

    // Mark as finalized
    referral.finalized = true;
    referral.finalizedAt = new Date();
    await referral.save();

    res.json({ success: true, message: "Referral finalized successfully", referral });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin cập nhật các trường bổ sung của referral
exports.updateReferralFields = async (req, res) => {
  try {
    const allowedFields = [
      "finalized",
      "finalizedAt",
      "message",
      "linkedin",
      "portfolio",
      "candidatePhone",
      "candidateEmail",
    ];
    const updates = req.body;


    const referral = await Referral.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // Update only allowed fields
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        referral[key] = updates[key];
      }
    });

    const savedReferral = await referral.save();

    res.json({ message: "Referral fields updated successfully", referral: savedReferral });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteReferral = async (req, res) => {
  try {
    const referral = await Referral.findByIdAndDelete(req.params.id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    res.json({ message: 'Referral deleted successfully', referral });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
