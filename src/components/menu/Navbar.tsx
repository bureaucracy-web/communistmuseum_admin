import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/menu/layout.css";
import { useLocation } from "react-router-dom";

type NavbarProps = {
  eventsData: any[];
  menuItems: any[];
  selectedMenuItem: any;
  setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  setEventsData: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedMenuItem: React.Dispatch<React.SetStateAction<any>>;
};

export default function Navbar({
  eventsData,
  setEventsData,
  menuItems,
  setMenuItems,
  selectedMenuItem,
  setSelectedMenuItem,
}: NavbarProps) {
  if (eventsData || selectedMenuItem) {
  }
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "");

  const apiKey = import.meta.env.VITE_API_KEY;
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const effectRan = useRef(false);

  function getNavigations() {
    fetch(`${apiEndpoint}navigationCategory/getAll`, {
      headers: {
        accept: "*/*",
        "api-key": `${apiKey}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMenuItems(data.data);
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }

  function getEventsByNavCategoryId(navCatId: number) {
    setSelectedCategoryId(navCatId);
    fetch(`${apiEndpoint}culturalEvent/getEventsByNavCategoryId/${navCatId}`, {
      headers: {
        accept: "*/*",
        "api-key": `${apiKey}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEventsData(data.data);
        const filteredItems = menuItems.filter((item) => item.id === navCatId);
        setSelectedMenuItem(filteredItems[0] || null);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }

  useEffect(() => {
    if (!effectRan.current) {
      getNavigations();
      effectRan.current = true;
    }
  }, []);

  // Default selection after menuItems loaded
  useEffect(() => {
    if (menuItems.length > 0 && selectedCategoryId === null) {
      const decodedPath = decodeURIComponent(currentPath).toLowerCase().trim();

      const matchedItem = menuItems.find(
        (item: any) => item.name.toLowerCase().trim() === decodedPath
      );

      if (matchedItem) {
        getEventsByNavCategoryId(matchedItem.id);
        setSelectedMenuItem(matchedItem);
      } else {
        const defaultCategory =
          menuItems.find((item: any) => item.name.toLowerCase() === "home") ||
          menuItems[0];

        getEventsByNavCategoryId(defaultCategory.id);
        setSelectedMenuItem(defaultCategory);
      }
    }
  }, [menuItems, currentPath]);

  if (!menuItems.length) {
    return (
      <div>
        <h2>Loading ...</h2>
      </div>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-white bg-white menuNavbar">
      <div className="container" id="containerProxy">
        <Link
          className="navbar-brand "
          id="brend"
          to="/"
          onClick={() => {
            const homeItem =
              menuItems.find((item) => item.name.toLowerCase() === "home") ||
              menuItems[0];
            getEventsByNavCategoryId(homeItem.id);
            setSelectedMenuItem(homeItem);
            navigate(`/`);
          }}
        >
          COMUPA
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto navbarUl">
            {menuItems.map((item: any) => (
              <li
                key={item.id}
                className={`nav-item ${
                  selectedCategoryId === item.id ? "active" : ""
                }`}
              >
                <button
                  onClick={() => {
                    getEventsByNavCategoryId(item.id);

                    navigate(`/${item.name}`);
                  }}
                  className="nav-link"
                >
                  {item.name.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
