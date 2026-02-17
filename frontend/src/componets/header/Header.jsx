import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header = ({ user, setUser }) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.logoLink}>
          <h1 className={styles.logo}>Ethiolodge</h1>
        </Link>
      </div>

      <div className={styles.right}>
        {user ? (
          <>
            <span className={styles.username}>Hi, {user.firstname}</span>
            {user.role === "admin" && <Link to="/upload">Upload</Link>}
            <button className={styles.logoutBtn} onClick={() => setUser(null)}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
