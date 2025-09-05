const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const referralCtrl = require("../controllers/referral");

// Recruiter gửi referral (hỗ trợ upload CV multipart field "cv")
router.post("/", auth, role(["recruiter"]), referralCtrl.uploadCV, referralCtrl.createReferral);

// Admin xem referral
router.get("/", auth, role(["admin"]), referralCtrl.getReferrals);

// Recruiter xem referral của mình
router.get("/mine", auth, role(["recruiter"]), referralCtrl.getMyReferrals);

// Admin cập nhật trạng thái/bonus referral
router.put("/:id", auth, role(["admin"]), referralCtrl.updateReferralStatus);

module.exports = router;
