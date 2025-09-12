const express = require("express");
const router = express.Router();
const {showCollections, showUsers, resetUsers, doLogin, doRegister, resetPassword, getRawPassword, removeUser} = require("../controllers/db");

router.get("/collections", showCollections);
router.get("/users", showUsers);
router.get("/users/reset", resetUsers);
router.post("/users/login", doLogin);
router.post("/users/signup", doRegister);
router.post("/users/resetPassword", resetPassword);
router.get("/user/:userId/raw-password", getRawPassword);
router.get("/user/:userId/remove", removeUser); // For testing purposes only
module.exports = router;
