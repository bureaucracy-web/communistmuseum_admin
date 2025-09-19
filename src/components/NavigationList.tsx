import "../assets/navigation/navigation.css";
import { DataGrid } from "@mui/x-data-grid";
import deleteImg from "../assets/home/delete.png";
import editImg from "../assets/home/edit.png";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import EditNavigationModal from "./EditNavigationModal";
import AddNavigationModal from "./AddNavigationModal";

type MyProps = {
  isColl: any;
  menuItems: any;
  setIsColl: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NavigationList({
  setIsColl,
  isColl,
  menuItems,
}: MyProps) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // --- Edit Modal ---
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // --- Add Modal ---
  const [openAddModal, setOpenAddModal] = useState(false);

  const [navigationData, setNavigationData] = useState([]);

  const apiKey = import.meta.env.VITE_API_KEY;
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const handleDelete = (id: number) => {
    Swal.fire({
      text: "The navigation will be permanently deleted. Are you sure you want to proceed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `${apiEndpoint}navigationCategory/delete/${id}`,
            {
              method: "DELETE",
              headers: { "api-key": apiKey },
            }
          );
          if (!res.ok) throw new Error("Failed to delete");
          getAllNavigations();
          coll();
        } catch (err) {
          console.error("Delete error:", err);
        }
      }
    });
  };

  const handleEdit = (row: any) => {
    setSelectedRow(row);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRow(null);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const coll = () => {
    setIsColl(!isColl);
  };

  const handleUpdate = async (updatedRow: any) => {
    try {
      const res = await fetch(
        `${apiEndpoint}navigationCategory/update/${updatedRow.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify(updatedRow),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      getAllNavigations();
      handleCloseEditModal();
      coll();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleCreate = async (newRow: any) => {
    try {
      const res = await fetch(`${apiEndpoint}navigationCategory/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify(newRow),
      });
      if (!res.ok) throw new Error("Create failed");
      getAllNavigations();
      handleCloseAddModal();
      coll();
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params: any) => {
        return (
          <a
            style={{
              color: "#1EAEDB",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            dir="rtl"
            href={`/${params.row.name}`}
            // onClick={(e) => {
            //   // e.preventDefault();

            //   navigate(`/${params.row.name}`);
            // }}
          >
            {params.row.name}
          </a>
        );
      },
    },
    {
      field: "isShowInNavbar",
      headerName: "Is Show In Navbar",
      flex: 1,
      minWidth: 80,
      renderCell: (params: any) => (
        <span>{params.row.isShowInNavbar ? "true" : "false"}</span>
      ),
    },
    {
      field: "isBackground",
      headerName: "Is Background",
      flex: 1,
      minWidth: 80,
      renderCell: (params: any) => (
        <span>{params.row.isBackground ? "true" : "false"}</span>
      ),
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
            onClick={() => handleEdit(params.row)}
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

  function getAllNavigations() {
    fetch(`${apiEndpoint}navigationCategory/getAll`, {
      headers: { accept: "*/*", "api-key": apiKey },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setNavigationData(data.data);
      })
      .catch((err) => console.error("Error fetching navigations:", err));
  }

  useEffect(() => {
    getAllNavigations();
  }, []);

  return (
    <>
      <div className="mt-4">
        <button className="seeAllData" onClick={() => setOpenAddModal(true)}>
          Add Navigation
        </button>
      </div>
      <div style={{ width: "100%", overflowX: "auto", marginTop: "15px" }}>
        <div style={{ minWidth: "800px" }}>
          <DataGrid
            className="dataGrid mt-4"
            rows={navigationData}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
            }}
            sx={{
              "& .MuiDataGrid-cell": { padding: "0 10px 0 32px !important" },
              "& .MuiDataGrid-columnHeader": {
                padding: "0 10px 0 32px !important",
              },
              "& .MuiDataGrid-menuIcon": { color: "black !important" },
            }}
            pageSizeOptions={[10, 20, 30, 50]}
            autoHeight
            getRowClassName={getRowClassName}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
          />
        </div>
        <EditNavigationModal
          open={openEditModal}
          onClose={handleCloseEditModal}
          row={selectedRow}
          onSave={handleUpdate}
          menuItems={menuItems}
        />
        <AddNavigationModal
          open={openAddModal}
          onClose={handleCloseAddModal}
          onCreate={handleCreate}
          menuItems={menuItems}
        />
      </div>
    </>
  );
}
