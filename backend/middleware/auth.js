import jwt from "jsonwebtoken";
import User from "../model/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/errorHandler.js";

const protect = asyncHandler(async (req, res, next) => {

  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized", 401));
  }
//console.log(token)
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decoded)

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    req.user = user;

    next();

  } catch (err) {
    console.log(err)
    return next(new AppError("Token expired", 401));
  }

});

export default protect;