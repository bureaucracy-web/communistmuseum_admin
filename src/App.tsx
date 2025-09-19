import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Layout from "./components/menu/Layout";
import { useState } from "react";
import CulturalEventDetails from "./components/CulturalEventDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import NavigationList from "./components/NavigationList";

export default function App() {
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any>([]);
  const [isColl, setIsColl] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
    const [query, setQuery] = useState("");
  

  return (
    <Router>
      <Layout
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
      >
        <Routes>
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />

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
                  setIsColl={setIsColl}
                  loading={loading}
                  setSelectedCategoryId={setSelectedCategoryId}
                  query={query}
                  setQuery={setQuery}
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

          <Route
            path="/list"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CulturalEventDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/navigationList"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <NavigationList
                  setIsColl={setIsColl}
                  isColl={isColl}
                  menuItems={menuItems}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
