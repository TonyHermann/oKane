import { Outlet } from "react-router-dom";
import { Navbar } from "../layout/Navbar";
import { Footer } from "../layout/Footer";
import styles from "./RootLayout.module.css";

export const RootLayout = () => {
  // TODO: [mobile-interface] Define the responsive shell, navigation pattern, touch targets, and mobile-first information hierarchy.
  return (
    <div className="main-layout">
      <Navbar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
