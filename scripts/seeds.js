require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Job = require("../models/Job");
const Referral = require("../models/Referral");

const db = require("../configs/db");

async function seed() {
  try {
    await db();

    // Xoá dữ liệu cũ
    await User.deleteMany({});
    await Job.deleteMany({});
    await Referral.deleteMany({});

    // Tạo password hash
    const password = "StrongPassword@123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // === Users ===
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    const recruiter = await User.create({
      name: "Recruiter User",
      email: "recruiter@example.com",
      password: hashedPassword,
      role: "recruiter",
      connections: [admin._id],
    });

    const candidate = await User.create({
      name: "Candidate User",
      email: "candidate@example.com",
      password: hashedPassword,
      role: "candidate",
      connections: [recruiter._id, admin._id],
    });

    // === Jobs ===
    const job1 = await Job.create({
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "Remote",
      bonus: 500,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      jobsdetail: {
        description: "React, TailwindCSS, REST API",
        requirement: "2 năm kinh nghiệm React",
        benefits: "Remote + thưởng dự án",
      },
    });

    const job2 = await Job.create({
      title: "Backend Developer",
      company: "Data Systems",
      location: "Hà Nội",
      bonus: 800,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      jobsdetail: {
        description: "Node.js, MongoDB, Microservices",
        requirement: "3 năm kinh nghiệm Node.js",
        benefits: "Chế độ tốt, 13 tháng lương",
      },
    });

    // Gán job cho admin & recruiter
    admin.jobs.push(job1._id, job2._id);
    recruiter.jobs.push(job1._id);
    await admin.save();
    await recruiter.save();

    // === Referral ===
    const referral = await Referral.create({
      recruiter: recruiter._id,
      admin: admin._id,
      candidate: candidate._id,
      job: job1._id,
      message: "Ứng viên này có kinh nghiệm React và rất phù hợp.",
      status: "submitted",
    });

    console.log("✅ Seed thành công!");
    console.log("=== Accounts ===");
    console.log("Admin:", admin.email, password);
    console.log("Recruiter:", recruiter.email, password);
    console.log("Candidate:", candidate.email, password);
    console.log("=== Jobs ===");
    console.log("Job1:", job1.title);
    console.log("Job2:", job2.title);
    console.log("=== Referral ===");
    console.log("Referral ID:", referral._id, "status:", referral.status);

    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed:", err);
    process.exit(1);
  }
}

seed();
