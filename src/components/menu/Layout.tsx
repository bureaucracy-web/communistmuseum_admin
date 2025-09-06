import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../../assets/menu/layout.css"

type LayoutProps = {
  children: ReactNode;
  eventsData: any[];
  menuItems: any[];
  selectedMenuItem: any;
  setEventsData: React.Dispatch<React.SetStateAction<any[]>>;
  setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedMenuItem: React.Dispatch<React.SetStateAction<any>>;
};
export default function Layout({
  children,
  eventsData,
  setEventsData,
  menuItems,
  setMenuItems,
  selectedMenuItem,
  setSelectedMenuItem,
}: LayoutProps) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        eventsData={eventsData}
        setEventsData={setEventsData}
        menuItems={menuItems}
        setMenuItems={setMenuItems}
        selectedMenuItem={selectedMenuItem}
        setSelectedMenuItem={setSelectedMenuItem}
      />
      <main className="container  flex-grow-1 mainContent">{children}</main>
      <Footer />
    </div>
  );
}
