import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import "./css/signup.css";

const CLOUD_NAME = "dqph4wcsj";
const UPLOAD_PRESET = "server";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: "",
    profilePic: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, profilePic: file }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
    const result = await res.json();
    return result.secure_url;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (isNaN(formData.age) || Number(formData.age) <= 0) {
      newErrors.age = "Age must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    let profilePicUrl = null;

    try {
      if (formData.profilePic) {
        setIsUploading(true);
        profilePicUrl = await uploadImageToCloudinary(formData.profilePic);
        setIsUploading(false);
      }

      setIsSubmitting(true);

      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          age: Number(formData.age),
          profilePic: profilePicUrl
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Signup failed");

      alert("Account created successfully");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <span className="error-text">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
            />
            {errors.age && <span className="error-text">{errors.age}</span>}
          </div>

          <div className="form-group">
            <label>Profile Picture</label>
            <div
              className="upload-area"
              onClick={() => document.getElementById("fileUpload").click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="preview-image" />
              ) : (
                <FiUpload size={40} />
              )}
              <p>Click to upload image</p>
            </div>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isUploading || isSubmitting}
          >
            {isUploading ? "Uploading..." : isSubmitting ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}