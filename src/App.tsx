import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Layout from "./components/menu/Layout";
import { useState } from "react";
import CulturalEventDetails from "./components/CulturalEventDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";

export default function App() {
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>({});
  const [showAll, setShowAll] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("token")
  );

  return (
    <Router>
      <Layout
        eventsData={eventsData}
        setEventsData={setEventsData}
        menuItems={menuItems}
        setMenuItems={setMenuItems}
        selectedMenuItem={selectedMenuItem}
        setSelectedMenuItem={setSelectedMenuItem}
      >
        <Routes>
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Home
                  eventsData={eventsData}
                  setEventsData={setEventsData}
                  menuItems={menuItems}
                  setMenuItems={setMenuItems}
                  selectedMenuItem={selectedMenuItem}
                  setSelectedMenuItem={setSelectedMenuItem}
                  // setShowAll={setShowAll}
                  // showAll={showAll}
                />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/:slug?"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Home
                  eventsData={eventsData}
                  setEventsData={setEventsData}
                  menuItems={menuItems}
                  setMenuItems={setMenuItems}
                  selectedMenuItem={selectedMenuItem}
                  setSelectedMenuItem={setSelectedMenuItem}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/details"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CulturalEventDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
