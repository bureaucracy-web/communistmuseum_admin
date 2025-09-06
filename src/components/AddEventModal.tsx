import {
  Modal,
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

type AddEventModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: FormData, files: File[], schedules: any[]) => void;
  menuItems: { id: number; name: string }[];
};

type MediaFile = {
  file: File;
  type: string;
};

export default function AddEventModal({
  open,
  onClose,
  onSave,
  menuItems,
}: AddEventModalProps) {
  const [languages, setLanguages] = useState<string[]>(["en"]);
  const [pdfImage, setPdfImage] = useState<File | null>(null);
  const [showError, setShowError] = useState(false);

  const initialFormData = {
    nameOrOrganizer_left: "",
    nameOrOrganizer_right: "",
    title_left: "",
    title_right: "",
    about_left: "",
    about_right: "",
    category_left: "",
    category_right: "",
    keyword: "",
    hostPlace_left: "",
    hostPlace_right: "",
    city_left: "",
    city_right: "",
    country_left: "",
    country_right: "",
    address_left: "",
    address_right: "",
    latitude: "",
    longitude: "",
    materialsMedium_left: "",
    materialsMedium_right: "",
    description_left: "",
    description_right: "",
    additionalNotes_left: "",
    additionalNotes_right: "",
    usefullExternalLinks: [""],
    navigationCategory: { id: "" },
    type: "text",
    isShowInHome: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const handleChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const createSchedule = (
    dayOfWeek = 1,
    startTime = "09:00",
    endTime = "17:00",
    month?: number
  ) => ({
    dayOfWeek,
    startTime,
    endTime,
    month,
  });

  const addSchedule = () => setSchedules((prev) => [...prev, createSchedule()]);
  const removeSchedule = (index: number) =>
    setSchedules((prev) => prev.filter((_, i) => i !== index));

  const detectFileType = (file: File) => {
    if (file.type.startsWith("image/")) return "photo";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf") return "pdf";
    if (file.name.endsWith(".doc") || file.name.endsWith(".docx"))
      return "word";
    if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))
      return "excel";
    return "file";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: MediaFile[] = Array.from(e.target.files).map((f) => ({
      file: f,
      type: detectFileType(f),
    }));

    setMediaFiles((prev) => {
      const existingNames = prev.map((mf) => mf.file.name);
      const filtered = newFiles.filter(
        (nf) => !existingNames.includes(nf.file.name)
      );
      const updated = [...prev, ...filtered];

      let typeToSet = "text";
      if (updated.some((mf) => mf.type === "photo")) typeToSet = "photo";
      else if (updated.length > 0) typeToSet = updated[0].type;
      handleChange("type", typeToSet);

      return updated;
    });

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      let typeToSet = "text";
      if (updated.some((mf) => mf.type === "photo")) typeToSet = "photo";
      else if (updated.some((mf) => mf.type === "pdf")) typeToSet = "pdf";
      else if (updated.some((mf) => mf.type === "video")) typeToSet = "video";
      else if (updated.some((mf) => mf.type === "audio")) typeToSet = "audio";
      handleChange("type", typeToSet);
      return updated;
    });
  };

  const handlePdfImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Select only image files for PDF preview.");
      e.target.value = "";
      return;
    }
    setPdfImage(file);
  };

  const handleSave = () => {
    if (!formData.navigationCategory.id) {
      setShowError(true);
      return;
    }

    const payload = new FormData();
    const combinedEvent = {
      ...formData,
      languages,
      schedules,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };
    payload.append("dto", JSON.stringify(combinedEvent));
    mediaFiles.forEach((mf) => payload.append("files", mf.file));
    if (pdfImage) payload.append("pdfImage", pdfImage);

    onSave(
      payload,
      mediaFiles.map((mf) => mf.file),
      schedules
    );
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setMediaFiles([]);
    setPdfImage(null);
    setSchedules([]);
    setShowError(false);
    onClose();
  };

  const editableFields: (keyof typeof initialFormData)[] = [
    "nameOrOrganizer_left",
    "nameOrOrganizer_right",
    "title_left",
    "title_right",
    "about_left",
    "about_right",
    "category_left",
    "category_right",
    "hostPlace_left",
    "hostPlace_right",
    "city_left",
    "city_right",
    "country_left",
    "country_right",
    "address_left",
    "address_right",
    "latitude",
    "longitude",
    "materialsMedium_left",
    "materialsMedium_right",
    "description_left",
    "description_right",
    "additionalNotes_left",
    "additionalNotes_right",
    "type",
    "keyword",
  ];

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          p: 4,
          bgcolor: "white",
          borderRadius: 2,
          maxWidth: 880,
          mx: "auto",
          mt: 5,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2>Add Cultural Event</h2>

        {editableFields.map((key) => (
          <TextField
            key={key}
            fullWidth
            margin="dense"
            label={key}
            value={formData[key] as string}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        ))}

        <FormControl fullWidth margin="dense">
          <InputLabel>Navigation Category</InputLabel>
          <Select
            value={formData.navigationCategory.id || ""}
            onChange={(e) => {
              setShowError(false);
              handleChange("navigationCategory", { id: e.target.value });
            }}
          >
            {menuItems.map((mi) => (
              <MenuItem key={mi.id} value={mi.id}>
                {mi.name}
              </MenuItem>
            ))}
          </Select>
          {showError && (
            <p style={{ color: "red" }}>
              Navigation category field is required*
            </p>
          )}
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={!!formData.isShowInHome}
              onChange={(e) => handleChange("isShowInHome", e.target.checked)}
            />
          }
          label="Show in Home"
        />

        <Box mt={2}>
          <h4>Upload Media</h4>
          <input
            id="file-upload"
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button variant="outlined" component="span">
              Select Files
            </Button>
          </label>
          <Box mt={1} display="flex" flexWrap="wrap" gap={2}>
            {mediaFiles.map((mf, i) => (
              <Box
                key={i}
                position="relative"
                border="1px solid #ccc"
                borderRadius={2}
                p={1}
                width={120}
                textAlign="center"
              >
                {mf.type === "photo" ? (
                  <img
                    src={URL.createObjectURL(mf.file)}
                    alt={mf.file.name}
                    style={{ width: "100%", height: 80, objectFit: "cover" }}
                  />
                ) : (
                  <p style={{ fontSize: 12 }}>
                    {mf.file.name.length > 10
                      ? mf.file.name.slice(0, 10) + "…"
                      : mf.file.name}
                  </p>
                )}
                <small>{mf.type}</small>
                <IconButton
                  size="small"
                  onClick={() => removeFile(i)}
                  sx={{ position: "absolute", top: 0, right: 0 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>

        {mediaFiles.some((mf) => mf.type === "pdf") && (
          <Box mt={2}>
            <h4>Upload PDF Image (optional)</h4>
            <input
              id="pdf-image-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePdfImageChange}
            />
            <label htmlFor="pdf-image-upload">
              <Button variant="outlined" component="span">
                Select PDF Image
              </Button>
            </label>
            {pdfImage && (
              <Box mt={1}>
                <img
                  src={URL.createObjectURL(pdfImage)}
                  alt="PDF Preview"
                  style={{ width: 120, height: 80, objectFit: "cover" }}
                />
              </Box>
            )}
          </Box>
        )}

        <Box mt={2}>
          <h4>Languages</h4>
          {["en", "ar", "hy", "ru"].map((lang) => (
            <FormControlLabel
              key={lang}
              control={
                <Checkbox
                  checked={languages.includes(lang)}
                  onChange={(e) => {
                    if (e.target.checked)
                      setLanguages((prev) => [...prev, lang]);
                    else setLanguages((prev) => prev.filter((l) => l !== lang));
                  }}
                />
              }
              label={lang.toUpperCase()}
            />
          ))}
        </Box>

        <Box mt={2}>
          <h4>Schedules</h4>
          {schedules.map((sch, i) => (
            <Box
              className="shedulesParrent"
              key={i}
              display="flex"
              gap={1}
              alignItems="center"
              mb={1}
            >
              <TextField
                select
                className="shedul"
                label="Month"
                value={sch.month ?? ""}
                onChange={(e) =>
                  handleScheduleChange(
                    i,
                    "month",
                    e.target.value === "" ? null : +e.target.value
                  )
                }
              >
                <MenuItem value="">Select Month</MenuItem>
                {[
                  { value: 1, label: "January" },
                  { value: 2, label: "February" },
                  { value: 3, label: "March" },
                  { value: 4, label: "April" },
                  { value: 5, label: "May" },
                  { value: 6, label: "June" },
                  { value: 7, label: "July" },
                  { value: 8, label: "August" },
                  { value: 9, label: "September" },
                  { value: 10, label: "October" },
                  { value: 11, label: "November" },
                  { value: 12, label: "December" },
                ].map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                className="shedul"
                select
                label="Day of Month"
                value={sch.dayOfMonth ?? ""}
                onChange={(e) =>
                  handleScheduleChange(
                    i,
                    "dayOfMonth",
                    e.target.value === "" ? null : +e.target.value
                  )
                }
              >
                <MenuItem value="">Select Day</MenuItem>
                {Array.from({ length: 31 }, (_, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>
                    {idx + 1}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                className="shedul"
                select
                label="Day of Week"
                value={sch.dayOfWeek ?? ""}
                onChange={(e) =>
                  handleScheduleChange(
                    i,
                    "dayOfWeek",
                    e.target.value === "" ? null : +e.target.value
                  )
                }
              >
                <MenuItem value="">Select Day</MenuItem>
                {[
                  { value: 1, label: "Monday" },
                  { value: 2, label: "Tuesday" },
                  { value: 3, label: "Wednesday" },
                  { value: 4, label: "Thursday" },
                  { value: 5, label: "Friday" },
                  { value: 6, label: "Saturday" },
                  { value: 7, label: "Sunday" },
                ].map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Start Time"
                type="time"
                value={sch.startTime}
                onChange={(e) =>
                  handleScheduleChange(i, "startTime", e.target.value)
                }
              />
              <TextField
                label="End Time"
                type="time"
                value={sch.endTime}
                onChange={(e) =>
                  handleScheduleChange(i, "endTime", e.target.value)
                }
              />

              <Button
                onClick={() => removeSchedule(i)}
                color="error"
                sx={{
                  backgroundColor: "#f44336", // normal red
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#d32f2f", // darker red on hover
                  },
                }}
              >
                X
              </Button>
            </Box>
          ))}
          <Button onClick={addSchedule}>Add Schedule</Button>
        </Box>

        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Create
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
