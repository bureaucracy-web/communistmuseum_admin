import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../../assets/menu/layout.css";

type LayoutProps = {
  children: ReactNode;
  eventsData: any[];
  menuItems: any[];
  selectedMenuItem: any;
  isColl: any;
  loading: any;
  selectedCategoryId: any;
  setEventsData: React.Dispatch<React.SetStateAction<any[]>>;
  setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedMenuItem: React.Dispatch<React.SetStateAction<any>>;
  setIsColl: React.Dispatch<React.SetStateAction<any>>;
  setLoading: React.Dispatch<React.SetStateAction<any>>;
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<any>>;
  setQuery: React.Dispatch<React.SetStateAction<any>>;
};
export default function Layout({
  children,
  eventsData,
  setEventsData,
  menuItems,
  setMenuItems,
  selectedMenuItem,
  setSelectedMenuItem,
  isColl,
  setIsColl,
  setLoading,
  loading,
  setSelectedCategoryId,
  selectedCategoryId,
  setQuery,
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
        isColl={isColl}
        setIsColl={setIsColl}
        setLoading={setLoading}
        loading={loading}
        setSelectedCategoryId={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
        setQuery={setQuery}
      />
      <main className="container  flex-grow-1 mainContent">{children}</main>
      <Footer />
    </div>
  );
}
