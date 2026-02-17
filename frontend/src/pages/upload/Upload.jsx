import React, { useState } from "react";
import axios from "axios";
import styles from "./Upload.module.css";
import { useNavigate } from "react-router-dom";

const Upload = ({ user }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    location: "Addis Abeba",
    price: "",
    number_of_room: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "admin") {
      alert("Only admin can upload properties!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("location", form.location);
      formData.append("price", form.price);
      formData.append("number_of_room", form.number_of_room);
      formData.append("description", form.description);
      formData.append("image", form.image);
      formData.append("userRole", user.role);

      await axios.post("http://localhost:5000/properties", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Redirect to home page (PropertyList)
      navigate("/");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload property. Try again.");
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleUpload}>
        <h2>Upload Property</h2>

        <label>Location</label>
        <select name="location" value={form.location} onChange={handleChange}>
          <option value="Addis Abeba">Addis Abeba</option>
          <option value="Bahirdar">Bahirdar</option>
          <option value="Gonder">Gonder</option>
          <option value="Jimma">Jimma</option>
          <option value="Hawassa">Hawassa</option>
          <option value="Bishoftu">Bishoftu</option>
        </select>

        <label>Image</label>
        <input type="file" name="image" onChange={handleChange} required />
        {preview && (
          <img src={preview} alt="preview" className={styles.preview} />
        )}

        <label>Price</label>
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <label>Number of Rooms</label>
        <input
          name="number_of_room"
          type="number"
          placeholder="Number of Rooms"
          value={form.number_of_room}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <button type="submit">Add Property</button>
      </form>
    </div>
  );
};

export default Upload;
