import React, { useState } from "react";
import "./styles/global.css"
import { Routes, Route } from "react-router-dom";
import Header from "./componets/header/Header";
import Signup from "./pages/signup/Signup";
import Login from "./pages/login/Login";
import Upload from "./pages/upload/Upload";
import PropertyList from "./componets/propertyList/PropertyList";
import BookingPage from "./pages/booking/BookingPage";

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <Header user={user} />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <div style={{ padding: "40px" }}>
                <h2>Welcome to Ethiolodge 🏨</h2>
              </div>
              <PropertyList user={user} />
            </>
          }
        />
        <Route path="/upload" element={<Upload user={user} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/booking/:propertyId"
          element={<BookingPage user={user} />}
        />
        <Route path="*" element={<PropertyList user={user} />} />
      </Routes>
    </>
  );
}

export default App;
