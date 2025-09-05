const express = require("express");
const router = express.Router();
const {showCollections, showUsers, resetUsers, doLogin, doRegister} = require("../controllers/db");

router.get("/collections", showCollections);
router.get("/users", showUsers);
router.get("/users/reset", resetUsers);
router.post("/users/login", doLogin);
router.post("/users/signup", doRegister);

module.exports = router;
