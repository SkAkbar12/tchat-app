// utils/token.js
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3hr" });

export const generateRefreshToken = () =>
  crypto.randomBytes(40).toString("hex");

export const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};