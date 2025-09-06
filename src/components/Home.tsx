import { useEffect, useRef, useState } from "react";
import "./../assets/home/home.css";
import { DataGrid, GridOverlay } from "@mui/x-data-grid";
import { makeStyles } from "@mui/styles";
import viewImage from "../assets/home/veiw.png";
import deleteImg from "../assets/home/delete.png";
import editImg from "../assets/home/edit.png";
import { useNavigate } from "react-router-dom";
import EditEventModal from "./EditEventModal";
import AddEventModal from "./AddEventModal";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

type MyProps = {
  eventsData: any[];
  menuItems: any[];
  selectedMenuItem: any;
  setEventsData: React.Dispatch<React.SetStateAction<any[]>>;
  setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedMenuItem: React.Dispatch<React.SetStateAction<any>>;
};

const useStyles = makeStyles({
  dataGrid: {
    "& .MuiDataGrid-cell": {
      padding: "0 10px 0 32px !important",
    },
    "& .MuiDataGrid-columnHeader": {
      padding: "0 10px 0 32px !important",
    },
    "& .MuiDataGrid-menuIcon": {
      color: "black !important",
    },
  },
});

export default function Home({
  eventsData,
  setEventsData,
  menuItems,
  selectedMenuItem,
  setMenuItems: _setMenuItems,
  setSelectedMenuItem: _setSelectedMenuItem,
}: MyProps) {
  const classes = useStyles();
  const navigate = useNavigate();
  const didRun = useRef(false);
  const apiKey = import.meta.env.VITE_API_KEY;
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const apiEndpointForUrl = import.meta.env.VITE_API_ENDPOINT_FOR_URL;
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "");

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(selectedMenuItem);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [matchedItemId, setMatchedItemId] = useState(1);

  const [shapeTrigger, setShapeTrigger] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShapeTrigger((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getRandomShape = () => {
    const shapes = ["circle", "square", "rectangle", "triangle"] as const;
    return shapes[Math.floor(Math.random() * shapes.length)];
  };
  const handleOpenModal = (row: any) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

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
        fetch(`${apiEndpoint}culturalEvent/${id}`, {
          method: "DELETE",
          headers: { "api-key": apiKey },
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to delete");
            }
            return res.json();
          })
          .then(() => {
            setEventsData((prev) => prev.filter((row) => row.id !== id));
            getEventsByNavCategoryId(matchedItemId);
          })
          .catch((err) => console.error("Delete error:", err));
      }
    });
  };

  const handleCloseModal = () => setOpenModal(false);

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

  const handleUpdate = (
    combinedEvent: any,
    files: File[],
    schedules: any[],
    id?: number,
    pdfImage?: File | null
  ) => {
    if (!id) return;

    const payload = new FormData();

    files.forEach((file) => payload.append("files", file));
    if (pdfImage) payload.append("pdfImage", pdfImage);
    payload.append("dto", JSON.stringify(combinedEvent));

    fetch(`${apiEndpoint}culturalEvent/update/${id}?replaceOldFile=true`, {
      method: "PUT",
      headers: { "api-key": apiKey },
      body: payload,
    })
      .then((res) => res.json())
      .then((updatedEvent) => {
        getEventsByNavCategoryId(matchedItemId);
        setOpenModal(false);
      })
      .catch((err) => console.error("Update error:", err));
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params: any) => {
        if (params.row.nameOrOrganizer_right) {
          return (
            <span dir="rtl" style={{ textAlign: "right", display: "block" }}>
              {params.row.nameOrOrganizer_right}
            </span>
          );
        }
        if (params.row.nameOrOrganizer_left) {
          return <span>{params.row.nameOrOrganizer_left}</span>;
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

        const { dayOfMonth, dayOfWeek, month, startTime, endTime } = schedule;

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

        // Month + Day
        if (month !== null && dayOfMonth !== null) {
          parts.push(`${monthNames[month - 1]}-${dayOfMonth}`);
        }

        // Weekday
        if (dayOfWeek !== null) {
          parts.push(weekNames[dayOfWeek - 1]);
        }

        // Time interval
        if (startTime && endTime) {
          parts.push(`${startTime} - ${endTime}`);
        }

        return parts.join(" / ");
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      renderCell: (params: any) => {
        if (params.row.description_right) {
          return (
            <span dir="rtl" style={{ textAlign: "right", display: "block" }}>
              {params.row.description_right}
            </span>
          );
        }
        if (params.row.description_left) {
          return <span>{params.row.description_left}</span>;
        }
        return null;
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <div className="actions">
          <img
            className="memberView"
            src={viewImage}
            alt="view"
            title="View"
            onClick={() =>
              navigate(`/details?id=${params.row.id}`, {
                state: { detail: params.row.id },
              })
            }
            style={{ cursor: "pointer" }}
          />
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

  const handleChange = (field: string, value: string) => {
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

  return (
    <div>
      <div className="container editMode">
        <div className="row mt-5">
          <div className="col-sm-12">
            {editMode ? (
              <input
                className="form-control"
                value={draft.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            ) : (
              <h2>{selectedMenuItem.name}</h2>
            )}
          </div>
        </div>
        <div className="row mt-4">
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
        <div className="row mt-4">
          <div className="col-sm-6">
            {editMode ? (
              <input
                className="form-control"
                value={draft.subHeader_left}
                placeholder="Sub header left"
                onChange={(e) => handleChange("subHeader_left", e.target.value)}
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
        <div className="row mt-4">
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

        <div className="row mt-4">
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
              />
            ) : (
              <span dir="rtl" style={{ textAlign: "right", display: "block" }}>
                {selectedMenuItem.description_right}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="btns">
        <div className="mt-3 ">
          {!editMode ? (
            <button className="btnStyles" onClick={() => setEditMode(true)}>
              Edit Page
            </button>
          ) : (
            <>
              <button className="btn btn-success me-2" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
        <div className=" mt-3">
          <button className=" btnStyles" onClick={() => setOpenAddModal(true)}>
            Add Event
          </button>
        </div>
      </div>
      <div className="container mt-4 ">
        {selectedMenuItem.id == 1 ? (
          <div>
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
                    getEventsForHome();
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
                // slots={{
                //   footer: CustomFooter,
                //   noRowsOverlay: () => (
                //     <GridOverlay>
                //       <div style={{ textAlign: "center", padding: "20px" }}>
                //         No data available in the table!
                //       </div>
                //     </GridOverlay>
                //   ),
                // }}
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

      <EditEventModal
        open={openModal}
        onClose={handleCloseModal}
        row={selectedRow}
        onSave={handleUpdate}
        menuItems={menuItems}
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
