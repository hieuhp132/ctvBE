const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/email');
const { getWelcomeEmailTemplate } = require('../utils/emailTemplates');
const { sendWelcomeEmail } = require('../utils/email');


exports.showUsers = async (req, res) => {
    try {
        const users = await User.find({},/* '-password -__v'*/).lean();
        const formattedUsers = users.map( user => ({
            id: user._id.toString(),
            name: user.name,
            password: user.password,
            email: user.email,
            credit: user.credit,
            role: user.role,
            paymentMethod: user.paymentMethod,
            listItem: user.listItem
        }));
        res.json({
            success: true,
            count: formattedUsers.length,
            data: formattedUsers
        })
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.resetUsers = async (req, res) => {
        
    const defaultUsers = [
        {
            name: "Admin",
            email: "admin@example.com",
            password: "admin123456789A!", 
            credit: 10000,
            role: "admin",
            paymentMethod: "credit_card",
        },
        {
            name: "Nguyen Van B",
            email: "ctv1@example.com",
            password: "1234567891011AAa!",
            credit: 500,
            role: "recruiter",
            paymentMethod: "paypal",
        }
    ];
    try {
        // Xoá toàn bộ user hiện có
        await User.deleteMany({});
        console.log("Reset thanh cong");
        const inserted = [];
        
        for (const data of defaultUsers) {
            const user = new User(data);
            await user.save();  // sẽ gọi pre-save hook để hash password
            inserted.push(user);
        }


        res.json({
            success: true,
            message: 'User data has been reset.',
            count: inserted.length,
            data: inserted.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }))
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.doRegister = async (req, res) => {
    try {

        const {name, email, password, promodeCode} = req.body;
        console.log('Register attempt:', {name, email, password, promodeCode});

        const existingUser = await User.findOne({email});
        if(existingUser) {
            console.log('Found user: ', existingUser._id);

            if(existingUser.password) { 
                console.log('User already registered with password');
                return res.status(400).json({
                    success: false,
                    message: 'Email da duoc dang ky, vui long dang nhap thay vi dang ky',
                    code: 'EMAIL_Exist_with_Password'
                });
            }
        }

        console.log('Creating new user');
        const user = new User({
            name, email, password
        });

        await user.save();
        console.log('New user created: ', user._id);
    
        // Send welcome email
        try {
            await sendWelcomeEmail(user.name, user.email, `${process.env.FRONTEND_URL}/verify-email`);
            console.log(`Welcome email sent to ${user.email}`);
        } catch (emailError) {
            console.error(`Failed to send welcome email to ${user.email}:`, emailError);
            // Do not block the response for email errors
        }

        res.json({
            success: true,
            massage: 'Dang ky thanh cong',
            user: { 
                _id: user._id,
                name: user.name,
                email: user.email,
                credit: user.credit,
                role: user.role
            },
        });
    } catch(err) {
        console.error("Register error:", err.message);
        res.status(500).json({success: false, message: "loi server"});
    }
}

exports.doLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        console.log('Login atempt:', {email, password});

        const user = await User.findOne({email});
        if(!user) {
            console.log('User not found for login');
            return res.status(400).json({success:false, message:'Email hoac mat khau khong dung' });
        }

        if(!user.password) {
            console.log('User exists but has no password (Google OAuth Only)')
            return res.status(400).json({
                success: false, message: 'Tai khoan nay chi dang nhap bang google', code: 'GOOGLE_ONLY_ACCOUNT'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch)  {
            console.log('Password mismatch for login');
            return res.status(400).json({success: false, message: 'Email hoac mat khau khong dung'});
        }

        console.log('Login successful:', user._id);
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });       
        res.json({
            success: true,
            message: 'Dang nhap thanh cong',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                credit: user.credit,
                role: user.role,
                token
            },
        })
    } catch(error) {
        console.error('Login error: ', error);
        res.status(500).json({success: false, message: 'Loi server'});
    }
}

exports.showCollections = async (req, res) =>  {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionsNames = collections.map(col => col.name);

        res.json ({
            success: true,
            count: collectionsNames.length,
            collections: collectionsNames
       });
    }catch(err) {
        res.status(500).json({success: false, message: err.message});
    }
}
