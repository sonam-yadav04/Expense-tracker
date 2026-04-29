import { User } from '../model/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Missing required fields!" });
    }

  
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ msg: "User not found" });
    }

   
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name
      }
    });

  } catch (err) {
    console.log("Error in login:", err);
    res.status(500).json({
      success: false,
      msg: "Error while logging in",
      error: err.message
    });
  }
};
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Required fields are missing" });
    }

  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      msg: "User registered successfully",
      user: newUser
    });

  } catch (err) {
    console.log("Error in signup:", err);
    res.status(500).json({
      success: false,
      msg: "Error while signing up",
      error: err.message
    });
  }
};



export const profile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (err) {
    console.log("Error fetching profile:", err);

    return res.status(500).json({
      success: false,
      msg: "Failed to fetch user profile",
      error: err.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ msg: "Name and email are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: updatedUser
    });

  } catch (err) {
    console.log("Error updating profile:", err);
    res.status(500).json({
      success: false,
      msg: "Error updating profile",
      error: err.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Current and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Password changed successfully"
    });

  } catch (err) {
    console.log("Error changing password:", err);
    res.status(500).json({
      success: false,
      msg: "Error changing password",
      error: err.message
    });
  }
};