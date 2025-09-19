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
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

type EditModalProps = {
  open: boolean;
  onClose: () => void;
  row: any;
  onSave: (updatedRow: any) => void;
  menuItems: any[];
};

export default function EditNavigationModal({
  open,
  onClose,
  row,
  onSave,
  menuItems,
}: EditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (row) {
      setFormData({
        ...row,
        relatedNavigationIds: row.relatedNavigationIds || [],
      });
    }
  }, [row]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving navigation category:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!row) return null;

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
          mt: 5,
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <h2>Edit Navigation Category</h2>

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

        {/* Multi select for relatedNavigationIds */}
        <FormControl fullWidth margin="dense">
          <InputLabel id="related-nav-label">Related Navigations</InputLabel>
          <Select
            labelId="related-nav-label"
            multiple
            value={formData.relatedNavigationIds || []}
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
                  maxHeight: 40 * 5.5,
                },
              },
            }}
          >
            {menuItems.map((item) => {
              const isCurrentEditing = row?.id && item.id === row.id;
              const isSelected = formData.relatedNavigationIds?.includes(
                item.id
              );

              return (
                <MenuItem
                  key={item.id}
                  value={item.id}
                  disabled={isCurrentEditing}
                  selected={isSelected} 
                  sx={{
                    backgroundColor: isCurrentEditing
                      ? "gray"
                      : isSelected
                      ? "green"
                      : "transparent",
                    color: isCurrentEditing || isSelected ? "white" : "black",
                    fontWeight: isCurrentEditing ? "bold" : "normal",
                    "&.Mui-selected": {
                      backgroundColor: isSelected
                        ? "green !important"
                        : "transparent",
                      color: "white",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: isSelected
                        ? "darkgreen !important"
                        : "#f0f0f0",
                    },
                    "&:hover": {
                      backgroundColor: isCurrentEditing
                        ? "gray"
                        : isSelected
                        ? "darkgreen"
                        : "#f0f0f0",
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
              checked={!!formData.isShowInNavbar}
              onChange={(e) => handleChange("isShowInNavbar", e.target.checked)}
            />
          }
          label="Show in Navbar"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!formData.isBackground}
              onChange={(e) => handleChange("isBackground", e.target.checked)}
            />
          }
          label="Background"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!formData.isShowInWorksPage}
              onChange={(e) =>
                handleChange("isShowInWorksPage", e.target.checked)
              }
            />
          }
          label="Show in Works Page"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!formData.isShowAllLocations}
              onChange={(e) =>
                handleChange("isShowAllLocations", e.target.checked)
              }
            />
          }
          label="Show All Locations"
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
            {isSaving ? "Saving..." : "Save"}
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
