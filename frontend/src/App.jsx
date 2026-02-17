import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

import Header from "./componets/header/Header";
import Signup from "./pages/signup/Signup";
import Login from "./pages/login/Login";
import Upload from "./pages/upload/Upload";
import PropertyList from "./componets/propertyList/PropertyList";
import Booking from "./pages/booking/Booking";
import SearchBanner from "./componets/searchBanner/SearchBanner";
import Footer from "./componets/footer/Footer";
import "../src/styles/global.css"
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
function App() {
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState(null);
const [properties, setProperties] = useState([]);


useEffect(() => {
  fetchProperties();
}, []);

const fetchProperties = async () => {
  const res = await axios.get("http://localhost:5000/properties");
  setProperties(res.data);
};

  return (
    <>
      <Header
        user={user}
        setUser={(u) => {
          setUser(u);
          if (!u) setFilters(null); // clear filters on sign out
        }}
      />
      <SearchBanner onSearch={setFilters} user={user} properties={properties} />

      <Routes>
        <Route
          path="/"
          element={
            <PropertyList
              user={user}
              filters={filters}
              properties={properties}
            />
          }
        />
        <Route path="/upload" element={<Upload user={user} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/booking/:id" element={<Booking user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
