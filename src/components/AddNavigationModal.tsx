import {
  Modal,
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

type AddModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (newRow: any) => void;
  menuItems: any[];
};

export default function AddNavigationModal({
  open,
  onClose,
  onCreate,
  menuItems,
}: AddModalProps) {
  const [formData, setFormData] = useState<any>({
    header_left: "",
    header_right: "",
    subHeader_left: "",
    subHeader_right: "",
    title_left: "",
    title_right: "",
    description_left: "",
    description_right: "",
    name: "",
    isShowInNavbar: false,
    isBackground: false,
    isShowInWorksPage: false,
    isShowAllLocations: false,
    relatedNavigationIds: [], 
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onCreate(formData);
      onClose();
    } catch (error) {
      console.error("Error creating navigation category:", error);
      alert("Failed to create. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const editableFields = [
    "name",
    "header_left",
    "header_right",
    "subHeader_left",
    "subHeader_right",
    "title_left",
    "title_right",
    "description_left",
    "description_right",
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          bgcolor: "white",
          borderRadius: 2,
          maxWidth: 800,
          mx: "auto",
          mt: 10,
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <h2>Add Navigation Category</h2>

        {editableFields.map((key) =>
          key === "description_left" || key === "description_right" ? (
            <TextField
              key={key}
              fullWidth
              margin="dense"
              label={key}
              value={formData[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              multiline
              minRows={3}
              maxRows={8}
            />
          ) : (
            <TextField
              key={key}
              fullWidth
              margin="dense"
              label={key}
              value={formData[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          )
        )}

        {/* 👇 Multi select for relatedNavigationIds */}
        <FormControl fullWidth margin="dense">
          <InputLabel id="related-nav-label">Related Navigations</InputLabel>
          <Select
            labelId="related-nav-label"
            multiple
            value={formData.relatedNavigationIds}
            onChange={(e) =>
              handleChange("relatedNavigationIds", e.target.value)
            }
            renderValue={(selected) =>
              menuItems
                .filter((m) => selected.includes(m.id))
                .map((m) => m.name)
                .join(", ")
            }
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 38 * 5.5, // 🔹 5 hat item-ic aveli depqum scrol
                },
              },
            }}
          >
            {menuItems.map((item) => {
              const isSelected = formData.relatedNavigationIds.includes(
                item.id
              );
              return (
                <MenuItem
                  key={item.id}
                  value={item.id}
                  sx={{
                    backgroundColor: isSelected ? "blue" : "transparent",
                    color: isSelected ? "white" : "black",
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

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isShowInNavbar}
              onChange={(e) => handleChange("isShowInNavbar", e.target.checked)}
            />
          }
          label="Show in Navbar"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isShowAllLocations}
              onChange={(e) =>
                handleChange("isShowAllLocations", e.target.checked)
              }
            />
          }
          label="Show All Locations"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isBackground}
              onChange={(e) => handleChange("isBackground", e.target.checked)}
            />
          }
          label="Background"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isShowInWorksPage}
              onChange={(e) =>
                handleChange("isShowInWorksPage", e.target.checked)
              }
            />
          }
          label="Show in Works Page"
        />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create"}
          </Button>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Modal>
  );
}
