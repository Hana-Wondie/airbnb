import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./BookingPage.module.css";

const BookingPage = ({ user }) => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({ startfrom: "", ends: "" });

  useEffect(() => {
    const fetchProperty = async () => {
      const res = await axios.get("http://localhost:5000/properties");
      const prop = res.data.find((p) => p.id === parseInt(propertyId));
      setProperty(prop);
    };
    fetchProperty();
  }, [propertyId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to book!");

    await axios.post("http://localhost:5000/bookings", {
      user_id: user.id,
      property_id: property.id,
      startfrom: form.startfrom,
      ends: form.ends,
    });

    alert("Booking successful!");
    navigate("/"); // redirect to home
  };

  if (!property) return <p>Loading property...</p>;

  return (
    <div className={styles.container}>
      <h2>Book {property.location}</h2>
      <p>{property.description}</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Start Date</label>
        <input
          type="date"
          name="startfrom"
          value={form.startfrom}
          onChange={handleChange}
          required
        />

        <label>End Date</label>
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

export default BookingPage;
