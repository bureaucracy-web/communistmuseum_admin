// src/components/EditEventModal.tsx
import {
  Modal,
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Editor } from "@tinymce/tinymce-react";
import { handleUpdate } from "../utils/updateHandler";

type EditEventModalProps = {
  open: boolean;
  onClose: () => void;
  row: any;
  onSave: (updatedRow: any) => void;
  menuItems: { id: number; name: string }[];
  apiKey: string;
  apiEndpoint: string;
};

export default function EditEventModal({
  open,
  onClose,
  row,
  onSave,
  menuItems,
  apiKey,
  apiEndpoint,
}: EditEventModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [languages, setLanguages] = useState<string[]>(["en"]);
  const [pdfImage, setPdfImage] = useState<File | null>(null);
  const [showError, setShowError] = useState(false);
  const [selectedNavCategory, setSelectedNavCategory] = useState<number | "">(
    row?.navigationCategory?.id || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (row) {
      setSelectedNavCategory(row.navigationCategory?.id || "");
      setFormData(row);
      setSchedules(row.schedules || []);
      setLanguages(
        row.languages && row.languages.length > 0 ? row.languages : ["en"]
      );
    }
  }, [row]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => {
        const existingNames = prev.map((f) => f.name);
        const filtered = newFiles.filter(
          (f) => !existingNames.includes(f.name)
        );
        return [...prev, ...filtered];
      });
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const addSchedule = () => {
    setSchedules((prev) => [
      ...prev,
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    ]);
  };

  const removeSchedule = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedNavCategory) {
      setShowError(true);
      return;
    }

    setIsSaving(true);

    try {
      const combinedEvent = {
        ...formData,
        navigationCategory: {
          id: selectedNavCategory,
        },
        languages,
        schedules,
        filesToDelete,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const updatedData = await handleUpdate(
        combinedEvent,
        files,
        schedules,
        formData.id,
        apiKey,
        apiEndpoint,
        pdfImage
      );

      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!row) return null;

  const editableFields = [
    "nameOrOrganizer_left",
    "nameOrOrganizer_right",
    "title_left",
    "title_right",
    "sub_title_left",
    "sub_title_right",
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
    "description_table_left",
    "description_table_right",
    "description_left",
    "description_right",
    "additionalNotes_left",
    "additionalNotes_right",
    "type",
    "keyword",
  ];

  const handlePdfImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      setPdfImage(file);
    } else {
      alert("Please select only image files (jpg, png, jpeg, webp, etc.)");
      e.target.value = "";
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          bgcolor: "white",
          borderRadius: 2,
          maxWidth: 1000,
          mx: "auto",
          mt: 10,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h2>Edit Cultural Event</h2>
        {editableFields.map((key) =>
          key === "description_left" || key === "description_right" ? (
            <Box key={key} mt={2}>
              <label>{key}</label>
              <Editor
                apiKey="bdajbbugxu6j05xr99jbswp90otf44nmrpzeztosd69rese0"
                onEditorChange={(content) => handleChange(key, content)}
                value={formData[key] || ""}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
              />
            </Box>
          ) : (
            <TextField
              key={key}
              fullWidth
              margin="dense"
              label={key}
              value={(formData[key] as string) || ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          )
        )}

        <FormControl fullWidth margin="dense">
          <InputLabel>Navigation Category</InputLabel>
          <Select
            value={selectedNavCategory}
            label="Navigation Category"
            onChange={(e) => {
              setShowError(false);
              setSelectedNavCategory(e.target.value as number);
            }}
          >
            {menuItems.map((mi) => (
              <MenuItem key={mi.id} value={mi.id}>
                {mi.name}
              </MenuItem>
            ))}
          </Select>
          {showError && (
            <div>
              <p style={{ color: "red" }}>
                Navigation category field is required*
              </p>
            </div>
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

        <Box mt={2} className="deleteModalIcon">
          <h4>Existing Media</h4>
          <Box display="flex" gap={1} flexWrap="wrap">
            {formData.mediaFiles
              ?.slice()
              .sort((a: any, b: any) => {
                const order = [
                  "photo",
                  "video",
                  "audio",
                  "pdf",
                  "excel",
                  "word",
                ];
                const typeA = order.includes(a.type) ? a.type : "other";
                const typeB = order.includes(b.type) ? b.type : "other";
                return order.indexOf(typeA) - order.indexOf(typeB);
              })
              .map((file: any, idx: number) => {
                const url = `${import.meta.env.VITE_API_ENDPOINT_FOR_URL}${
                  file.url
                }`;
                const type = file.type;
                const isImage = type === "photo";
                const isVideo = type === "video";
                const isAudio = type === "audio";
                const isPdf = type === "pdf";
                const isExcel = type === "excel";
                const isWord = type === "word";

                return (
                  <Box
                    key={idx}
                    position="relative"
                    width={150}
                    height={150}
                    borderRadius={1}
                    overflow="hidden"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="#f0f0f0"
                    textAlign="center"
                    p={1}
                  >
                    {isImage && (
                      <img
                        src={url}
                        alt={file.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    {isVideo && (
                      <video
                        src={url}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        controls
                      />
                    )}
                    {isAudio && (
                      <audio src={url} style={{ width: "100%" }} controls />
                    )}
                    {(isPdf || isExcel || isWord) && (
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        width="100%"
                      >
                        <span style={{ fontSize: 12, wordBreak: "break-word" }}>
                          {file.name}
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, color: "blue" }}
                        >
                          Open
                        </a>
                      </Box>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {
                        const confirmDelete = window.confirm(
                          "Do you really want to delete this file?"
                        );
                        if (confirmDelete) {
                          setFormData((prev: any) => ({
                            ...prev,
                            mediaFiles: prev.mediaFiles.filter(
                              (f: any) => f.id !== file.id
                            ),
                          }));
                          setFilesToDelete((prev) => [...prev, file.id]);
                        }
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(255,255,255,0.7)",
                        zIndex: 10,
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.9)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
          </Box>
        </Box>

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
          <Box className="upload" display="flex" gap={1} flexWrap="wrap" mt={1}>
            {files.map((file, idx) => {
              const url = URL.createObjectURL(file);
              const isImage = file.type.startsWith("image/");
              const isVideo = file.type.startsWith("video/");
              const isAudio = file.type.startsWith("audio/");
              const isPDF = file.type === "application/pdf";

              return (
                <Box
                  key={idx}
                  position="relative"
                  border="1px solid #ccc"
                  borderRadius={2}
                  p={1}
                  width={120}
                  textAlign="center"
                >
                  {isImage && (
                    <img
                      src={url}
                      alt="new"
                      style={{ width: "100%", height: 80, objectFit: "cover" }}
                    />
                  )}
                  {isVideo && (
                    <video
                      src={url}
                      style={{ width: "100%", height: 80, objectFit: "cover" }}
                      controls
                    />
                  )}
                  {isAudio && (
                    <audio src={url} style={{ width: "100%" }} controls />
                  )}
                  {isPDF && (
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => window.open(url, "_blank")}
                    >
                      <span>PDF</span>
                    </div>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => removeFile(idx)}
                    sx={{ position: "absolute", top: 0, right: 0 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Box>

        {files.some((f) => f.type === "application/pdf") && (
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
                    if (e.target.checked) {
                      setLanguages((prev) => [...prev, lang]);
                    } else {
                      setLanguages((prev) => prev.filter((l) => l !== lang));
                    }
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
            <Box key={i} display="flex" gap={1} alignItems="center" mb={1}>
              <TextField
                label="Year"
                type="number"
                className="shedul"
                value={sch.year ?? ""}
                onChange={(e) =>
                  handleScheduleChange(
                    i,
                    "year",
                    e.target.value === "" ? null : +e.target.value
                  )
                }
                InputProps={{ inputProps: { min: 1900, max: 2100 } }}
              />
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
                <MenuItem value="">None</MenuItem>
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
                <MenuItem value="">None</MenuItem>
                {Array.from({ length: 31 }, (_, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>
                    {idx + 1}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className="shedul"
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
                <MenuItem value="">None</MenuItem>
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
              <Button onClick={() => removeSchedule(i)} color="error">
                X
              </Button>
            </Box>
          ))}
          <Button onClick={addSchedule}>Add Schedule</Button>
        </Box>

        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
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
      </Box>
    </Modal>
  );
}
