const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function resetPassword(userId, newPassword) {
  try {
    await mongoose.connect("mongodb+srv://hieuhp132:hieuhp123321!@sim.tbjccsx.mongodb.net/sim?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      console.error("User not found");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    console.log("Password reset successfully");
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Replace with the user ID and new password
resetPassword("68bdcf22131c403154a093ea", "newpassword123");
