import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./PropertyList.module.css";

const PropertyList = ({ user, filters }) => {
  const [properties, setProperties] = useState([]);
  const [filteredProps, setFilteredProps] = useState([]);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAllBookings();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/properties");
      setProperties(res.data);
      setFilteredProps(res.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/bookings");
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  /* ================= FILTERING ================= */

  useEffect(() => {
    if (!filters) {
      setFilteredProps(properties);
      return;
    }

    const result = properties.filter(
      (p) =>
        (!filters.location ||
          p.location.toLowerCase() === filters.location.toLowerCase()) &&
        (!filters.number_of_room ||
          Number(p.number_of_room) === Number(filters.number_of_room)),
    );

    setFilteredProps(result);
  }, [filters, properties]);

  /* ================= BOOKING LOGIC ================= */

  const handleBook = (id) => {
    if (!user) return navigate("/signup");
    navigate(`/booking/${id}`);
  };

  const handleUnbook = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:5000/bookings/${bookingId}`);
      fetchAllBookings();
      fetchProperties();
    } catch (error) {
      console.error("Error removing booking:", error);
    }
  };

  const isBooked = (propertyId) => {
    return bookings.some((b) => b.property_id === propertyId);
  };

  /* ================= UI ================= */

  return (
    <div className={styles.listContainer}>
      {filteredProps.length === 0 && <h2>No result found</h2>}

      {filteredProps.map((prop) => {
        const propertyBookings = bookings.filter(
          (b) => b.property_id === prop.id,
        );

        return (
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

            {/* ========== GUEST BUTTON ========== */}
            {user?.role === "guest" && (
              <button
                className={styles.bookBtn}
                disabled={prop.booked > 0 || isBooked(prop.id)}
                onClick={() => handleBook(prop.id)}
              >
                {prop.booked > 0 || isBooked(prop.id) ? "Booked" : "Book Now"}
              </button>
            )}

            {/* ========== NOT LOGGED IN ========== */}
            {!user && (
              <button
                className={styles.bookBtn}
                onClick={() => navigate("/signup")}
              >
                Book Now
              </button>
            )}

            {/* ========== ADMIN VIEW (ONLY HIS PROPERTIES) ========== */}
            {user?.role === "admin" &&
              prop.user_id === user.id &&
              propertyBookings.map((b) => (
                <div key={b.booking_id} className={styles.adminBooking}>
                  <p>
                    <strong>Guest:</strong> {b.firstname} {b.lastname} |{" "}
                    {b.email}
                  </p>
                  <p>
                    <strong>From:</strong> {b.startfrom} <strong>To:</strong>{" "}
                    {b.ends}
                  </p>
                  <button onClick={() => handleUnbook(b.booking_id)}>
                    Remove Booking
                  </button>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
};

export default PropertyList;
