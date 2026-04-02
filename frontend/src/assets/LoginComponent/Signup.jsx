import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUpload } from 'react-icons/fi';

// Hardcoded Cloudinary credentials (as you did)
const CLOUD_NAME = "dqph4wcsj";
const UPLOAD_PRESET = "server";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Simple toast hook (replace with any toast library if desired)
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };
  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
  return { show, ToastContainer };
};

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePic: null,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { show, ToastContainer } = useToast();
  const navigate = useNavigate();
  // optional, if you want to auto-login after signup

  // Validation functions (unchanged)
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  const validatePasswordStrength = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{4,}$/.test(password);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePasswordStrength(formData.password)) newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and a number';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.profilePic) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(formData.profilePic.type)) newErrors.profilePic = 'Only JPEG, PNG, GIF, or WEBP images are allowed';
      else if (formData.profilePic.size > 5 * 1024 * 1024) newErrors.profilePic = 'Image size must be less than 5MB';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePic: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      if (errors.profilePic) setErrors(prev => ({ ...prev, profilePic: '' }));
    } else {
      setFormData(prev => ({ ...prev, profilePic: null }));
      setImagePreview(null);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', UPLOAD_PRESET);
    const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: data });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || 'Image upload failed');
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      show('Please fix the errors in the form.', 'error');
      return;
    }

    let profilePicUrl = null;
    if (formData.profilePic) {
      setIsUploading(true);
      try {
        profilePicUrl = await uploadImageToCloudinary(formData.profilePic);
        show('Profile picture uploaded successfully.', 'success');
      } catch (error) {
        show(error.message, 'error');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, profilePic: profilePicUrl }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      show('Account created successfully!', 'success');
      // Optionally auto-login
      // const data = await response.json();
      // login(data.user);
      navigate('/login');
    } catch (error) {
      show(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Profile Picture Upload */}
          <div className="form-group">
            <label>Profile Picture (optional)</label>
            <div
              className={`upload-area ${errors.profilePic ? 'error' : ''}`}
              onClick={() => document.getElementById('file-upload').click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="preview-image" />
              ) : (
                <FiUpload size={40} color="#aaa" />
              )}
              <p className="upload-text">Click to upload or drag and drop</p>
              <p className="upload-hint">PNG, JPEG, GIF, WEBP (max 5MB)</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {errors.profilePic && <span className="error-message">{errors.profilePic}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="submit-button"
            disabled={isUploading || isSubmitting}
          >
            {isUploading ? 'Uploading image...' : isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7fafc;
          padding: 1rem;
        }
        .auth-card {
          background: white;
          max-width: 500px;
          width: 100%;
          padding: 2.5rem;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        }
        .auth-card h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .auth-subtitle {
          color: #718096;
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a5568;
        }
        .form-group input {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.15s ease;
        }
        .form-group input:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 3px rgba(49,130,206,0.1);
        }
        .form-group input.error {
          border-color: #e53e3e;
        }
        .error-message {
          color: #e53e3e;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        .password-wrapper {
          position: relative;
        }
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          color: #718096;
        }
        .upload-area {
          border: 2px dashed #cbd5e0;
          border-radius: 0.5rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          background: #f7fafc;
          transition: border-color 0.15s ease;
        }
        .upload-area.error {
          border-color: #e53e3e;
        }
        .upload-area:hover {
          border-color: #3182ce;
        }
        .preview-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 50%;
        }
        .upload-text {
          font-size: 0.875rem;
          color: #4a5568;
        }
        .upload-hint {
          font-size: 0.75rem;
          color: #a0aec0;
        }
        .submit-button {
          background: #3182ce;
          color: white;
          font-weight: 600;
          padding: 0.75rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .submit-button:hover:not(:disabled) {
          background: #2c5282;
        }
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #718096;
        }
        .auth-footer a {
          color: #3182ce;
          text-decoration: none;
          font-weight: 500;
        }
        .auth-footer a:hover {
          text-decoration: underline;
        }
        /* Toast styles */
        .toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .toast {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          animation: slideIn 0.2s ease;
        }
        .toast-success {
          background: #48bb78;
        }
        .toast-error {
          background: #f56565;
        }
        .toast-info {
          background: #4299e1;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}