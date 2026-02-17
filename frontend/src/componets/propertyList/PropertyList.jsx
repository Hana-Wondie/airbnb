import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./PropertyList.module.css";

const PropertyList = ({ user }) => {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const res = await axios.get("http://localhost:5000/properties");
    setProperties(res.data);
  };

  return (
    <div className={styles.listContainer}>
      {properties.length === 0 && <p>No properties found.</p>}
      {properties.map((prop) => (
        <div key={prop.id} className={styles.card}>
          <img
            src={`http://localhost:5000/uploads/${prop.image}`}
            alt={prop.location}
          />
          <h3>{prop.location}</h3>
          <p>{prop.description}</p>
          <p>
            <strong>Price:</strong> {prop.price} ETB | <strong>Rooms:</strong>{" "}
            {prop.number_of_room}
          </p>

          {/* Show Book Now button only for guests */}
          {user?.role === "guest" && (
            <button
              className={styles.bookBtn}
              onClick={() => navigate(`/booking/${prop.id}`)}
            >
              Book Now
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PropertyList;
