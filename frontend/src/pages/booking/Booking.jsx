import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Booking.module.css";

const Booking = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ startfrom: "", ends: "" });

  if (!user) {
    navigate("/signup"); // redirect if not logged in
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/bookings", {
        user_id: user.id,
        property_id: id,
        startfrom: form.startfrom,
        ends: form.ends,
      });
      alert("Booking successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Book Property</h1>
      <form className={styles.card} onSubmit={handleBooking}>
        <label>Start Date:</label>
        <input
          type="date"
          name="startfrom"
          value={form.startfrom}
          onChange={handleChange}
          required
        />
        <label>End Date:</label>
        <input
          type="date"
          name="ends"
          value={form.ends}
          onChange={handleChange}
          required
        />
        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
};

export default Booking;
