import { Outlet } from "react-router-dom";
import { Navbar } from "../layout/Navbar";
import { Footer } from "../layout/Footer";

export const RootLayout = () => {
  // TODO: [mobile-interface] Define the responsive shell, navigation pattern, touch targets, and mobile-first information hierarchy.
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
