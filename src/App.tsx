import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Home from "./components/Home";
import Layout from "./components/menu/Layout";
import CulturalEventDetails from "./components/CulturalEventDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import NavigationList from "./components/NavigationList";
import Art from "./components/Art";

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

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Router>
      <Routes>
        {/* Login always accessible */}
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Art page: only role art */}
        <Route
          path="/art"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : role === "art" ? (
              <Art />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Admin routes: dynamic paths */}
        <Route
          path="/*"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : role === "art" ? (
              <Navigate to="/art" replace />
            ) : role === "admin" ? (
              <ProtectedRoute isAuthenticated={!!token} requiredRole="admin">
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
                      index
                      element={
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
                      }
                    />
                    <Route path="details" element={<CulturalEventDetails />} />
                    <Route path="list" element={<CulturalEventDetails />} />
                    <Route
                      path="navigationList"
                      element={
                        <NavigationList
                          setIsColl={setIsColl}
                          isColl={isColl}
                          menuItems={menuItems}
                        />
                      }
                    />
                    {/* All other dynamic admin paths */}
                    <Route
                      path=":slug"
                      element={
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
                      }
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
