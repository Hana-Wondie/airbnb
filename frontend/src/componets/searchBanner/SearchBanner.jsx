import React, { useState, useEffect } from "react";
import styles from "./SearchBanner.module.css";

const SearchBanner = ({ onSearch, user, properties }) => {
  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState("");
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (properties) {
      const uniqueLocations = [...new Set(properties.map((p) => p.location))];
      setLocations(uniqueLocations);
    }
  }, [properties]);

  const handleSearch = () => {
    onSearch({ location, number_of_room: rooms });
  };

  const handleClear = () => {
    setLocation("");
    setRooms("");
    onSearch(null);
  };

  if (!user) return null;

  return (
    <div className={styles.banner}>
      <select value={location} onChange={(e) => setLocation(e.target.value)}>
        <option value="">All Locations</option>
        {locations.map((loc, index) => (
          <option key={index} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      <select value={rooms} onChange={(e) => setRooms(e.target.value)}>
        <option value="">All Rooms</option>
        <option value="1">1 Room</option>
        <option value="2">2 Rooms</option>
        <option value="3">3 Rooms</option>
        <option value="4">4 Rooms</option>
      </select>

      <button onClick={handleSearch}>Search</button>
      <button onClick={handleClear}>Clear</button>
    </div>
  );
};

export default SearchBanner;
