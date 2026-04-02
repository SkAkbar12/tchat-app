import mongoose from "mongoose";
import bcrypt from "bcrypt";

const defaultMalePics = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzFzOAWFn0UGEL4d9SRlKXQVfzFVsDDWnqOA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpNW3uqZtV5e7ODS8GyWwS57ngpw_86lmX1w&s",
  "https://www.shutterstock.com/image-vector/young-man-anime-style-character-260nw-2240084831.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOukdT8EPMcyg3ZZn2pWQnXnxwe3SF4LYcIQ&s"
];

const defaultFemalePics = [
  "https://img.freepik.com/premium-vector/pout-face-anime-gamer-girl-esport-gaming-vector-logo-mascot_162048-615.jpg?semt=ais_incoming&w=740&q=80",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDnWQwQi7cE28hfiH3_d-oUEciP3AB087D9Q&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3BUwy2z55vHwC_dAK7-nP8zznYfVCR1IYFQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSduDP2a9HKgDoRBCPmQPkiw9r3tN9RiTEbRw&s"
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "user" },
    refreshToken: String,
    gender: { type: String, enum: ["male", "female"], required: true },
    age: { type: Number, required: true },
    profilePic: { type: String },
  },
  { timestamps: true }
);

// Hash password and set default profile pic if none provided
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);

  if (!this.profilePic) {
    if (this.gender === "male") {
      this.profilePic =
        defaultMalePics[Math.floor(Math.random() * defaultMalePics.length)];
    } else if (this.gender === "female") {
      this.profilePic =
        defaultFemalePics[Math.floor(Math.random() * defaultFemalePics.length)];
    }
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("chatuser", userSchema);