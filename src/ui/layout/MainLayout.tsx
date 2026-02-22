import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  onOpenCategoryManager?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onOpenCategoryManager,
}) => {
  return (
    <div className="main-layout">
      <Navbar onOpenCategoryManager={onOpenCategoryManager} />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};
