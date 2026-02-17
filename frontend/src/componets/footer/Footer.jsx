import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3>Ethiolodge</h3>
          <p>Your trusted place to find and book beautiful homes.</p>
        </div>

        <div className={styles.section}>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className={styles.section}>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} Ethiolodge. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
