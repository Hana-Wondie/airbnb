import React from "react";
import styles from "./Header.module.css";
import { FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = ({ user }) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.homeLink}>
          <FaHome className={styles.icon} />
          <h1 className={styles.logo}>Ethiolodge</h1>
        </Link>
      </div>

      <div className={styles.right}>
        {user ? (
          <>
            <span className={styles.username}>Hi, {user.firstname}</span>
            {user.role === "admin" && (
              <Link to="/upload" className={styles.uploadBtn}>
                Upload
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/signup" className={styles.signupBtn}>
              Sign Up
            </Link>
            <Link to="/login" className={styles.loginBtn}>
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
