import User from "../model/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/errorHandler.js";
import sendResponse from '../utils/apiResponse.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
} from "../utils/tokenHandler.js";

// ---------- SIGNUP ----------
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, profilePic, gender, age } = req.body;

  // 1. Validate required fields
  if (!name || !email || !password || !gender || !age) {
    return next(new AppError("All fields are required", 400));
  }

  // 2. Validate gender
  const validGenders = ['male', 'female'];
  if (!validGenders.includes(gender.toLowerCase())) {
    return next(new AppError("Gender must be 'male' or 'female'", 400));
  }

  // 3. Validate age (positive integer)
  const ageNumber = Number(age);
  if (isNaN(ageNumber) || ageNumber <= 0 || !Number.isInteger(ageNumber)) {
    return next(new AppError("Age must be a positive integer", 400));
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
      profilePic, // optional
      gender: gender.toLowerCase(),
      age: ageNumber,
    });

    sendResponse(res, 201, {
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("Email already exists", 400));
    }
    next(err);
  }
});

// ---------- LOGIN ----------
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);

  sendResponse(res, 200, {
    _id: user._id,
    email: user.email,
    name: user.name,
    profilePic: user.profilePic,
    accessToken,
  });
});

// ---------- REFRESH TOKEN ----------
export const refresh = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(new AppError("No refresh token", 401));

  const user = await User.findOne({ refreshToken: token });
  if (!user) {
    res.clearCookie("refreshToken");
    return next(new AppError("Invalid refresh token", 401));
  }

  const newAccess = generateAccessToken(user._id);
  const newRefresh = generateRefreshToken();

  user.refreshToken = newRefresh;
  await user.save();

  setRefreshCookie(res, newRefresh);

  res.json({
    success: true,
    accessToken: newAccess,
    data: { id: user._id, name: user.name, email: user.email },
  });
});

// ---------- LOGOUT ----------
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await User.updateOne(
      { refreshToken: token },
      { $unset: { refreshToken: 1 } }
    );
  }
  res.clearCookie("refreshToken");
  res.json({ success: true });
});

// ---------- GET ALL USERS (search) ----------
export const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});