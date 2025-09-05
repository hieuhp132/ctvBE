const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  bonus: { type: Number, default: 0 },
  deadline: { type: Date },
  jobsdetail: {
    description: { type: String, default: "" },
    requirement: { type: String, default: "" },
    benefits: { type: String, default: "" }
  },
  other: { type: String, default: "" }
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
