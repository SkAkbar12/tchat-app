import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "chatuser" },
  content: { type: String },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }
},{
  timestamps:true
});

export default mongoose.model("Message", messageSchema);