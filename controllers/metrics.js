const Referral = require("../models/Referral");
const User = require("../models/User");

exports.balances = async (req, res) => {
  try {
    // Admin credit: start 5000 minus sum of hired bonuses
    const baseCredit = 5000;
    const hired = await Referral.aggregate([
      { $match: { status: 'hired' } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$bonus" } } } },
    ]);
    const paid = hired?.[0]?.total || 0;
    // CTV bonus map by recruiter id
    const byRecruiter = await Referral.aggregate([
      { $match: { status: 'hired' } },
      { $group: { _id: "$recruiter", total: { $sum: { $toDouble: "$bonus" } } } },
    ]);
    const ctvBonusById = {};
    for (const r of byRecruiter) {
      ctvBonusById[String(r._id)] = r.total;
    }
    res.json({ adminCredit: baseCredit - paid, ctvBonusById });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


