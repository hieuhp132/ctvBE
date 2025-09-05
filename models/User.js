const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{15,}$/;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: { 
        type: String,
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId && this.facebookId;
        },
        minlength: [15, "Mat khau 15 ky tu"],
        validate: {
            validator: function (v) {
                if(!v || this.googleId || this.facebookId) return true;
                return passwordRegex.test(v);
            },
            message: props => "Mat khau can co 1 chu hoa, 1 chu thuong, 1 so va 1 ky tu dac biet"
        }
    },
    credit: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ["candidate", "admin", "recruiter"],
        default: "recruiter"
    },
    jobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      }],
})

// Hash mat khau truoc khi luu
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

//==== helper function ====
// matchPassword
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model("User", userSchema);
module.exports = User;
