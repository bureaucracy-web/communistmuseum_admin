import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Collapse } from "bootstrap";
import "../../assets/menu/layout.css";

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

  function toggleNavbar() {
    const navbar = document.getElementById("navbarNav");
    if (navbar) {
      const bsCollapse =
        Collapse.getInstance(navbar) || new Collapse(navbar, { toggle: false });
      if (navbar.classList.contains("show")) {
        bsCollapse.hide(); // bacvac e → pakum enq
      } else {
        bsCollapse.show(); // pakvac e → bacum enq
      }
    }
  }

  function closeNavbar() {
    const navbar = document.getElementById("navbarNav");
    if (navbar) {
      const bsCollapse =
        Collapse.getInstance(navbar) || new Collapse(navbar, { toggle: false });
      bsCollapse.hide();
    }
  }

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
          className="navbar-brand"
          id="brend"
          to="/"
          onClick={() => {
            const homeItem =
              menuItems.find((item) => item.name.toLowerCase() === "home") ||
              menuItems[0];
            getEventsByNavCategoryId(homeItem.id);
            setSelectedMenuItem(homeItem);
            navigate(`/`);
            closeNavbar();
          }}
        >
          COMUPA
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar} // ← sa stexcum e toggle logic
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
                onClick={() => {
                  getEventsByNavCategoryId(item.id);
                  navigate(`/${item.name}`);
                  closeNavbar();
                }}
              >
                <span className="nav-link" style={{ cursor: "pointer" }}>
                  {item.name.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
