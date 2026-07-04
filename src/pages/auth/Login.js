import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { postLogin } from "../../api/adminApi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await postLogin(email, password);
      console.log("Login Response:", data); // Check console to verify data

      if (data.success) {
        // FIX: Use "token" to match your axiosInstance interceptor
        localStorage.setItem("token", data.token); 
        
        // Save admin data (make sure your backend returns 'adminData' or 'data')
        localStorage.setItem("adminData", JSON.stringify(data.adminData || data.data));

        const token = localStorage.getItem("token");
const adminData = JSON.parse(localStorage.getItem("adminData"));

        console.log(token);
        console.log(adminData);
        navigate("/admin");
        
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>

      {error && (
        <p style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form> 
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
};
export default Login;