import React, { useState } from "react";
import styles from "./Login.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/login", form);

      setUser({
        id: res.data.id,
        firstname: res.data.firstname,
        role: res.data.role,
      });

      navigate("/"); // redirect to home
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("User not found. Please signup.");
        navigate("/signup");
      } else if (err.response && err.response.status === 401) {
        alert("Wrong password.");
      } else {
        console.error(err);
        alert("Login failed.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleLogin}>
        <h2>Welcome Back</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
