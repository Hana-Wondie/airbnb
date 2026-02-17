import React, { useState } from "react";
import styles from "./Signup.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = ({ setUser }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "guest",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/signup", form);

      // Auto login after signup
      const loginRes = await axios.post("http://localhost:5000/login", {
        email: form.email,
        password: form.password,
      });

      setUser({
        id: loginRes.data.id,
        firstname: loginRes.data.firstname,
        role: loginRes.data.role,
      });

      navigate("/"); // go home
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert("User already exists. Please login.");
        navigate("/login");
      } else {
        console.error(err);
        alert("Signup failed. Try again.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <input
          name="firstname"
          placeholder="First Name"
          onChange={handleChange}
          required
        />
        <input
          name="lastname"
          placeholder="Last Name"
          onChange={handleChange}
          required
        />
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

        <select name="role" onChange={handleChange}>
          <option value="guest">Guest</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
