import { useEffect, useState } from "react";
import "./../assets/home/home.css";
import { DataGrid } from "@mui/x-data-grid";
import { makeStyles } from "@mui/styles";
import deleteImg from "../assets/home/delete.png";
import editImg from "../assets/home/edit.png";
import { useNavigate, useLocation } from "react-router-dom";
import EditEventModal from "./EditEventModal";
import AddEventModal from "./AddEventModal";
import Swal from "sweetalert2";
import { handleUpdate as updateEvent } from "../utils/updateHandler";
import search from "../assets/home/search.png";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

type MyProps = {
  eventsData: any[];
  menuItems: any[];
  selectedMenuItem: any;
  loading: any;
  query: any;
  setEventsData: React.Dispatch<React.SetStateAction<any[]>>;
  setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedMenuItem: React.Dispatch<React.SetStateAction<any>>;
  setIsColl: React.Dispatch<React.SetStateAction<any>>;
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<any>>;
  setQuery: React.Dispatch<React.SetStateAction<any>>;
};

const useStyles = makeStyles({
  dataGrid: {
    "& .MuiDataGrid-cell": { padding: "0 10px 0 32px !important" },
    "& .MuiDataGrid-columnHeader": { padding: "0 10px 0 32px !important" },
    "& .MuiDataGrid-menuIcon": { color: "black !important" },
  },
});

export default function Home({
  eventsData,
  setEventsData,
  menuItems,
  selectedMenuItem,
  setMenuItems: _setMenuItems,
  setSelectedMenuItem: _setSelectedMenuItem,
  setIsColl: setIsColl,
  loading,
  setSelectedCategoryId,
  query,
  setQuery,
}: MyProps) {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const apiKey = import.meta.env.VITE_API_KEY;
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const apiEndpointForUrl = import.meta.env.VITE_API_ENDPOINT_FOR_URL;

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(selectedMenuItem);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [matchedItemId, setMatchedItemId] = useState(1);

  const currentPath = location.pathname.replace("/", "");

  const handleUpdate = async (
    combinedEvent: any,
    files: File[],
    schedules: any[],
    id?: number,
    pdfImage?: File | null
  ) => {
    if (!id) return;

    try {
      await updateEvent(
        combinedEvent,
        files,
        schedules,
        id,
        apiKey,
        apiEndpoint,
        pdfImage
      );
      getEventsByNavCategoryId(matchedItemId);
      setOpenModal(false);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleOpenModal = (row: any) => {
    setSelectedRow(row);
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  useEffect(() => {
    if (menuItems.length > 0) {
      const decodedPath = decodeURIComponent(currentPath).toLowerCase().trim();
      const matchedItem = menuItems.find(
        (item: any) => item.name.toLowerCase().trim() === decodedPath
      );
      if (matchedItem) setMatchedItemId(matchedItem.id);
    }
  }, [menuItems, currentPath]);

  const getRandomShape = () => {
    const shapes = ["circle", "square", "rectangle", "triangle"] as const;
    return shapes[Math.floor(Math.random() * shapes.length)];
  };
  // 🗑 Delete event
  const handleDelete = (id: number) => {
    Swal.fire({
      text: "The event will be permanently deleted. Are you sure you want to proceed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${apiEndpoint}culturalEvent/${id}`, {
            method: "DELETE",
            headers: { "api-key": apiKey },
          });
          if (!res.ok) throw new Error("Failed to delete");
          setEventsData((prev) => prev.filter((row) => row.id !== id));
          getEventsByNavCategoryId(matchedItemId);
        } catch (err) {
          console.error("Delete error:", err);
        }
      }
    });
  };

  useEffect(() => {
    if (menuItems.length > 0) {
      const decodedPath = decodeURIComponent(currentPath).toLowerCase().trim();

      const matchedItem = menuItems.find((item: any) => {
        if (decodedPath) {
          return item.name.toLowerCase().trim() === decodedPath;
        } else {
          return { id: 1 };
        }
      });
      setMatchedItemId(matchedItem.id);
    }
  }, [menuItems, currentPath]);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params: any) => {
        if (params.row.nameOrOrganizer_right) {
          return (
            <a
              style={{
                direction: "rtl",
                textAlign: "right",
                color: "#1EAEDB",
                textDecoration: "underline",
                cursor: "pointer",
                display: "block",
              }}
              href={`/details?id=${params.row.id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/details?id=${params.row.id}`, {
                  state: { detail: params.row.id },
                });
              }}
            >
              {params.row.nameOrOrganizer_right}
            </a>
          );
        }
        if (params.row.nameOrOrganizer_left) {
          return (
            <a
              style={{
                color: "#1EAEDB",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              dir="rtl"
              href={`/details?id=${params.row.id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/details?id=${params.row.id}`, {
                  state: { detail: params.row.id },
                });
              }}
            >
              {params.row.nameOrOrganizer_left}
            </a>
          );
        }
        return null;
      },
    },
    {
      field: "type",
      headerName: "Type",
      flex: 0.4, // karchacnum enq
      minWidth: 80, // minimum 80px, vor ban chi poqrana
      filterable: true,
      renderCell: (params: any) => {
        const type = params.row.type;
        const mediaFiles = params.row.mediaFiles || [];

        if (type === "photo") {
          const photo = mediaFiles.find((file: any) => file.type === "photo");
          const mediaUrl = photo ? `${apiEndpointForUrl}${photo.url}` : null;
          return mediaUrl ? (
            <img
              src={mediaUrl}
              alt="event"
              style={{ width: 40, height: 40, objectFit: "cover" }}
            />
          ) : (
            <span>Photo</span>
          );
        }

        if (type === "text") return <span>Text</span>;
        if (type === "video") return <span>Video</span>;
        if (type === "audio") return <span>Audio</span>;
        if (type === "pdf") return <span>PDF</span>;

        return <span>{type}</span>;
      },
    },

    {
      field: "startDateTime",
      headerName: "Date",
      flex: 1,
      filterable: true,
      renderCell: (params: any) => {
        const schedule = params.row?.schedules?.[0];
        if (!schedule) return "";

        const { dayOfMonth, dayOfWeek, month, year, startTime, endTime } =
          schedule;

        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const weekNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const parts: string[] = [];

        // Day + Month + Year
        let datePart = "";
        if (dayOfMonth !== null) {
          datePart += dayOfMonth + " ";
        }
        if (month !== null) {
          datePart += monthNames[month - 1] + " ";
        }
        if (year !== null) {
          datePart += year;
        }
        if (datePart) {
          parts.push(datePart.trim());
        }

        // Weekday
        if (dayOfWeek !== null) {
          parts.push(weekNames[dayOfWeek - 1]);
        }

        // Time interval
        if (startTime && endTime) {
          const formatTime = (t: string) => t.slice(0, 5); // "HH:mm"
          parts.push(`${formatTime(startTime)} - ${formatTime(endTime)}`);
        }

        return parts.join(" / ");
      },
    },

    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      renderCell: (params: any) => {
        if (params.row.description_table_right) {
          return (
            <span dir="rtl" style={{ textAlign: "right", display: "block" }}>
              {params.row.description_table_right}
            </span>
          );
        }
        if (params.row.description_table_left) {
          return <span>{params.row.description_table_left}</span>;
        }
        return null;
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <div className="actions">
          <img
            className="memberView"
            src={editImg}
            alt="edit"
            title="Edit"
            onClick={() => handleOpenModal(params.row)}
            style={{ cursor: "pointer" }}
          />
          <img
            className="memberView"
            src={deleteImg}
            alt="delete"
            title="Delete"
            onClick={() => handleDelete(params.row.id)}
            style={{ cursor: "pointer" }}
          />
        </div>
      ),
    },
  ];

  const getRowClassName = (params: any) =>
    params.indexRelativeToCurrentPage % 2 === 0 ? "grayed" : "";

  const handlePaginationChange = (newModel: any) =>
    setPaginationModel(newModel);

  function getAllEvents() {
    fetch(`${apiEndpoint}culturalEvent/getAll`, {
      headers: { accept: "*/*", "api-key": apiKey },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setEventsData(data.data))
      .catch((err) => console.error("Error fetching events:", err));
  }
  function getEventsByNavCategoryId(navCatId: number) {
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
      })
      .catch((err) => console.error("Error fetching events:", err));
  }

  function getEventsForHome() {
    fetch(`${apiEndpoint}culturalEvent/getEventsForHome`, {
      headers: { accept: "*/*", "api-key": apiKey },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEventsData(data.data);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }

  useEffect(() => {
    setDraft(selectedMenuItem);
  }, [selectedMenuItem]);

  const handleChange = (field: string, value: string | boolean | number[]) => {
    setDraft((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setDraft(selectedMenuItem);
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${apiEndpoint}navigationCategory/update/${draft.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify(draft),
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const updated = await res.json();

      _setSelectedMenuItem(updated.data);
      setEditMode(false);
      setIsColl(true);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleSaveNewEvent = (payload: FormData) => {
    fetch(`${apiEndpoint}culturalEvent/create`, {
      method: "POST",
      headers: { "api-key": apiKey },
      body: payload,
    })
      .then((res) => res.json())
      .then(() => {
        getEventsByNavCategoryId(matchedItemId);
        setOpenAddModal(false);
      })
      .catch((err) => console.error("Create error:", err));
  };

  const handleSearch = () => {
    const payload = { search_data: query };

    fetch(
      `${apiEndpoint}culturalEvent/getEventsBySearchAndNavId/${matchedItemId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({ dto: payload }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setEventsData(data.data);
      })
      .catch((err) => console.error("Create error:", err));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const center: LatLngExpression | null =
    eventsData.length > 0 && eventsData[0].latitude && eventsData[0].longitude
      ? [eventsData[0].latitude, eventsData[0].longitude]
      : null;

  if (!loading) {
    return <></>;
  }
  return (
    <div>
      <div className="container editMode">
        <div className="mt-3 searchDiv">
          <input
            className="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <img
            src={search}
            alt="search"
            style={{ cursor: "pointer" }}
            onClick={handleSearch}
          />
        </div>

        <div className="row mt-2">
          <div className="col-sm-12">
            {editMode ? (
              <input
                className="form-control"
                value={draft.name}
                placeholder="Category name"
                onChange={(e) => handleChange("name", e.target.value)}
              />
            ) : (
              ""
            )}
          </div>
        </div>

        {/* Boolean checkboxes */}
        <div className="row mt-2">
          <div className="col-sm-3">
            {editMode ? (
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={draft.isShowInNavbar}
                  onChange={(e) =>
                    handleChange("isShowInNavbar", e.target.checked)
                  }
                />
                <label className="form-check-label">Show in Navbar</label>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="col-sm-3">
            {editMode ? (
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={draft.isBackground}
                  onChange={(e) =>
                    handleChange("isBackground", e.target.checked)
                  }
                />
                <label className="form-check-label">Background</label>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="col-sm-3">
            {editMode ? (
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={draft.isShowInWorksPage}
                  onChange={(e) =>
                    handleChange("isShowInWorksPage", e.target.checked)
                  }
                />
                <label className="form-check-label">Show in Works Page </label>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="col-sm-3">
            {editMode ? (
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={draft.isShowAllLocations}
                  onChange={(e) =>
                    handleChange("isShowAllLocations", e.target.checked)
                  }
                />
                <label className="form-check-label">Show All Locations </label>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>

        {editMode ||
        selectedMenuItem.header_left ||
        selectedMenuItem.header_right ? (
          <div className="row mt-2">
            <div className="col-sm-6">
              {editMode ? (
                <input
                  className="form-control"
                  value={draft.header_left}
                  placeholder="Header left"
                  onChange={(e) => handleChange("header_left", e.target.value)}
                />
              ) : (
                <h2>{selectedMenuItem.header_left}</h2>
              )}
            </div>
            <div className="col-sm-6">
              {editMode ? (
                <input
                  className="form-control"
                  value={draft.header_right}
                  placeholder="Header right"
                  onChange={(e) => handleChange("header_right", e.target.value)}
                />
              ) : (
                <h2 dir="rtl" style={{ textAlign: "right" }}>
                  {selectedMenuItem.header_right}
                </h2>
              )}
            </div>
          </div>
        ) : (
          ""
        )}

        {editMode ? (
          ""
        ) : selectedMenuItem?.relatedNavigationIds?.length > 0 ? (
          <div className="mt-2">
            <span>See works: </span>
            <div className="relateds">
              {selectedMenuItem.relatedNavigationIds &&
                selectedMenuItem.relatedNavigationIds.length > 0 &&
                menuItems
                  .filter((item) =>
                    selectedMenuItem.relatedNavigationIds.includes(item.id)
                  )
                  .map((item) => (
                    <a
                      key={item.id}
                      href={`/${item.name}`}
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "#1EAEDB",
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
            </div>
          </div>
        ) : (
          ""
        )}

        {editMode && (
          <FormControl fullWidth margin="dense">
            <InputLabel id="related-nav-label">Related Navigations</InputLabel>
            <Select
              labelId="related-nav-label"
              multiple
              value={draft.relatedNavigationIds || []}
              onChange={(e) =>
                handleChange("relatedNavigationIds", e.target.value as number[])
              }
              renderValue={(selected: number[]) =>
                menuItems
                  .filter((m) => selected.includes(m.id))
                  .map((m) => m.name)
                  .join(", ")
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 38 * 5.5,
                  },
                },
              }}
            >
              {menuItems.map((item) => {
                const isCurrentEditing = item.id === selectedMenuItem.id;
                const isSelected = draft.relatedNavigationIds?.includes(
                  item.id
                );

                return (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                    disabled={isCurrentEditing}
                    sx={{
                      backgroundColor: isCurrentEditing
                        ? "gray"
                        : isSelected
                        ? "green"
                        : "transparent",
                      color: isCurrentEditing || isSelected ? "white" : "black",
                      fontWeight: isCurrentEditing ? "bold" : "normal",
                      "&.Mui-selected": {
                        backgroundColor: "green !important",
                        color: "white",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "darkgreen !important",
                      },
                    }}
                  >
                    {item.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}

        {editMode ? (
          ""
        ) : (
          <div className="location">
            {selectedMenuItem.isShowAllLocations && center && (
              <section className="section">
                <MapContainer
                  center={center}
                  zoom={5}
                  className="leaflet-container"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {eventsData
                    .filter((ev) => ev.latitude && ev.longitude)
                    .map((ev) => (
                      <Marker
                        key={ev.id}
                        position={
                          [ev.latitude, ev.longitude] as LatLngExpression
                        }
                      >
                        <Popup>
                          <div style={{ maxWidth: "220px" }}>
                            {ev.image && (
                              <img
                                src={ev.image}
                                alt={ev.nameOrOrganizer_left}
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  marginBottom: "6px",
                                }}
                              />
                            )}
                            <h4 style={{ margin: "0 0 5px 0" }}>
                              <a
                                href="#"
                                style={{
                                  color: "blue",
                                  textDecoration: "underline",
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/details?id=${ev.id}`);
                                }}
                              >
                                {ev.nameOrOrganizer_left}
                                {ev.nameOrOrganizer_right
                                  ? ` | ${ev.nameOrOrganizer_right}`
                                  : ""}
                              </a>
                            </h4>

                            {ev.date && (
                              <p style={{ margin: "4px 0" }}>
                                📅 {new Date(ev.date).toLocaleDateString()}
                              </p>
                            )}

                            {ev.location && (
                              <p style={{ margin: "4px 0" }}>
                                📍 {ev.location}
                              </p>
                            )}

                            {ev.description && (
                              <p
                                style={{
                                  margin: "4px 0",
                                  fontSize: "0.9em",
                                  color: "#555",
                                }}
                              >
                                {ev.description.length > 100
                                  ? ev.description.slice(0, 100) + "..."
                                  : ev.description}
                              </p>
                            )}

                            <button
                              style={{
                                background: "#007bff",
                                color: "#fff",
                                border: "none",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginTop: "6px",
                              }}
                              onClick={() => navigate(`/details?id=${ev.id}`)}
                            >
                              See more
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>
              </section>
            )}
          </div>
        )}
        {editMode ||
        selectedMenuItem.subHeader_left ||
        selectedMenuItem.subHeader_right ? (
          <div className="row mt-2">
            <div className="col-sm-6">
              {editMode ? (
                <input
                  className="form-control"
                  value={draft.subHeader_left}
                  placeholder="Sub header left"
                  onChange={(e) =>
                    handleChange("subHeader_left", e.target.value)
                  }
                />
              ) : (
                <h2>{selectedMenuItem.subHeader_left}</h2>
              )}
            </div>
            <div className="col-sm-6">
              {editMode ? (
                <input
                  className="form-control"
                  value={draft.subHeader_right}
                  placeholder="Sub header right"
                  onChange={(e) =>
                    handleChange("subHeader_right", e.target.value)
                  }
                />
              ) : (
                <h2 dir="rtl" style={{ textAlign: "right" }}>
                  {selectedMenuItem.subHeader_right}
                </h2>
              )}
            </div>
          </div>
        ) : (
          ""
        )}

        {editMode ||
        selectedMenuItem.title_left ||
        selectedMenuItem.title_right ? (
          <div className="row mt-2">
            <div className="col-sm-6">
              {editMode ? (
                <input
                  className="form-control"
                  value={draft.title_left}
                  placeholder="Title left"
                  onChange={(e) => handleChange("title_left", e.target.value)}
                />
              ) : (
                <h2>{selectedMenuItem.title_left}</h2>
              )}
            </div>
            <div className="col-sm-6">
              {editMode ? (
                <input
                  className="form-control"
                  value={draft.title_right}
                  placeholder="Title right"
                  onChange={(e) => handleChange("title_right", e.target.value)}
                />
              ) : (
                <h2 dir="rtl" style={{ textAlign: "right" }}>
                  {selectedMenuItem.title_right}
                </h2>
              )}
            </div>
          </div>
        ) : (
          ""
        )}

        {editMode ||
        selectedMenuItem.description_left ||
        selectedMenuItem.description_right ? (
          <div className="row mt-2">
            <div className="col-sm-12">
              {editMode ? (
                <textarea
                  className="form-control"
                  placeholder="Description left"
                  value={draft.description_left}
                  onChange={(e) =>
                    handleChange("description_left", e.target.value)
                  }
                />
              ) : (
                <span style={{ display: "block" }}>
                  {selectedMenuItem.description_left}
                </span>
              )}
            </div>

            <div className="col-sm-12 mt-4">
              {editMode ? (
                <textarea
                  className="form-control"
                  placeholder="Description Right"
                  value={draft.description_right}
                  onChange={(e) =>
                    handleChange("description_right", e.target.value)
                  }
                  style={{ textAlign: "right", display: "block" }}
                />
              ) : (
                <span
                  dir="rtl"
                  style={{ textAlign: "right", display: "block" }}
                >
                  {selectedMenuItem.description_right}
                </span>
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="btns">
        {editMode ? (
          ""
        ) : (
          <div className=" mt-2">
            <button
              className=" btnStyles"
              onClick={() => {
                setSelectedCategoryId(4.5);
                navigate(`/navigationList`);
              }}
            >
              Show All Navigations
            </button>
          </div>
        )}
        <div className="mt-2 ">
          {!editMode ? (
            <button className="btnStyles" onClick={() => setEditMode(true)}>
              Edit Page
            </button>
          ) : (
            <div className="mt-3">
              <button className="btn btn-success me-2" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {editMode ? (
        ""
      ) : (
        <div className="container mt-2 ">
          <div className="showDetailsDiv">
            {selectedMenuItem.id == 1 ? (
              <div className="showAllNavigations">
                <div>
                  {!showAll ? (
                    <button
                      className="seeAllData"
                      onClick={() => {
                        setShowAll(true);
                        getAllEvents();
                      }}
                    >
                      Show More
                    </button>
                  ) : (
                    <button
                      className="seeAllData"
                      onClick={() => {
                        setShowAll(false);
                        if (query) {
                          handleSearch();
                        } else {
                          getEventsForHome();
                        }
                      }}
                    >
                      Show less
                    </button>
                  )}
                </div>
              </div>
            ) : (
              ""
            )}
            <button
              className="seeAllData "
              onClick={() => setOpenAddModal(true)}
            >
              Add Event
            </button>
          </div>
          {eventsData.length > 0 && matchedItemId !== 1 ? (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <div style={{ minWidth: "800px" }}>
                <DataGrid
                  className={`${classes.dataGrid} dataGrid mt-4`}
                  rows={eventsData}
                  columns={columns}
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 10 } },
                  }}
                  sx={{
                    "& .MuiDataGrid-cell": {
                      padding: "0 10px 0 15px !important",
                    },
                    "& .MuiDataGrid-columnHeader": {
                      padding: "0 10px 0 20px !important",
                    },
                  }}
                  pageSizeOptions={[10, 20, 30, 50]}
                  autoHeight
                  getRowClassName={getRowClassName}
                  paginationModel={paginationModel}
                  onPaginationModelChange={handlePaginationChange}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {eventsData.map((item) => {
                const shape = getRandomShape();
                let containerStyle: React.CSSProperties = {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  overflow: "hidden",
                  padding: "0",
                  boxSizing: "border-box",
                };

                let shapeStyle: React.CSSProperties = {
                  width: "100px",
                  height: "100px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ccc",
                  transition: "all 0.8s ease-in-out",
                };

                if (shape === "circle") {
                  shapeStyle.borderRadius = "50%";
                  shapeStyle.transform = "scale(1)";
                  shapeStyle.transition = "all 0.8s ease-in-out";
                } else if (shape === "rectangle") {
                  shapeStyle.width = "150px";
                  shapeStyle.transform = "scale(1)";
                  shapeStyle.transition = "all 0.8s ease-in-out";
                } else if (shape === "triangle") {
                  shapeStyle = {
                    ...shapeStyle,
                    width: "100px",
                    height: "100px",
                    backgroundColor: "transparent",
                    border: "none",
                    position: "relative",
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  };
                }

                const photo = item.mediaFiles?.find(
                  (file: any) => file.type === "photo"
                );

                const mediaUrl = photo
                  ? `${apiEndpointForUrl}${photo.url}`
                  : null;

                return (
                  <div
                    className="homeItems"
                    key={item.id}
                    onClick={() =>
                      navigate(`/details?id=${item.id}`, {
                        state: { detail: item.id },
                      })
                    }
                  >
                    <div className="homeChild">
                      <div style={containerStyle}>
                        <div style={shapeStyle}>
                          {mediaUrl ? (
                            <img
                              src={mediaUrl}
                              alt="event"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                transition: "all 0.8s ease-in-out",
                                color: "#333",
                                background:
                                  shape === "triangle"
                                    ? "#f0f0f0"
                                    : "transparent",
                                clipPath:
                                  shape === "triangle"
                                    ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                                    : "none",
                                paddingTop: shape === "triangle" ? "35px" : "0",
                              }}
                            >
                              {item.type}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {(item.nameOrOrganizer_right ||
                      item.nameOrOrganizer_left) && (
                      <div
                        style={{
                          marginTop: "5px",
                          textAlign: "center",
                          fontSize: "12px",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.nameOrOrganizer_right
                          ? item.nameOrOrganizer_right
                          : item.nameOrOrganizer_left}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <EditEventModal
        open={openModal}
        onClose={handleCloseModal}
        row={selectedRow}
        onSave={(updatedRow: any) => {
          handleUpdate(
            updatedRow,
            updatedRow.files || [],
            updatedRow.schedules || [],
            updatedRow.id,
            updatedRow.pdfImage || null
          );
        }}
        menuItems={menuItems}
        apiKey={apiKey}
        apiEndpoint={apiEndpoint}
      />

      <AddEventModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSave={handleSaveNewEvent}
        menuItems={menuItems}
      />
    </div>
  );
}
