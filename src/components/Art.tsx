import { Box, Button, TextField, IconButton, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import "./../assets/home/art.css";
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";

type MediaFile = {
  file: File;
  type: "photo" | "audio" | "pdf" | "video" | "other";
};

type Schedule = {
  year?: number | null;
  month?: number | null;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  startTime?: string | null;
  endTime?: string | null;
};

type FormData = {
  nameOrOrganizer_left: string;
  nameOrOrganizer_right: string;
  title_left: string;
  title_right: string;
  sub_title_left: string;
  sub_title_right: string;
  about_left: string;
  about_right: string;
  category_left: string;
  category_right: string;
  keyword: string;
  hostPlace_left: string;
  hostPlace_right: string;
  city_left: string;
  city_right: string;
  country_left: string;
  country_right: string;
  address_left: string;
  address_right: string;
  latitude: string;
  longitude: string;
  materialsMedium_left: string;
  materialsMedium_right: string;
  description_left: string;
  description_right: string;
  description_table_left: string;
  description_table_right: string;
  additionalNotes_left: string;
  additionalNotes_right: string;
  usefullExternalLinks: string[];
  navigationCategory: { id: string };
  type: "text" | "image" | "video";
  isShowInHome: boolean;
  public: boolean;
};

const englishFields = [
  { key: "nameOrOrganizer_left", label: "Name" },
  { key: "title_left", label: "Title" },
  { key: "materialsMedium_left", label: "Materials / Medium" },
  { key: "about_left", label: "Artist Bio" },
  { key: "usefullExternalLinks", label: "Useful External Links" },
  {
    key: "description_table_left",
    label: "One line description ",
  },
  { key: "additionalNotes_left", label: "Short Description (Wall Text)" },
  { key: "description_left", label: "Full Description" },
];

const arabicFields = [
  { key: "nameOrOrganizer_right", label: "الاسم" },
  { key: "title_right", label: "العنوان" },
  { key: "materialsMedium_right", label: "المواد  / الوسيلة" },
  { key: "about_right", label: "السيرة الذاتية" },
  { key: "usefullExternalLinks", label: "روابط مفيدة" },
  { key: "description_table_right", label: "وصف بجملة او سطر  واحدة" },
  { key: "additionalNotes_right", label: "وصف مختصر (على الحائط بجانب العمل)" },
  { key: "description_right", label: "الوصف الكامل" },
];

export default function AddArtFormFull() {
  const apiKey = import.meta.env.VITE_API_KEY;
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const [formData, setFormData] = useState<FormData>({
    nameOrOrganizer_left: "",
    nameOrOrganizer_right: "",
    title_left: "",
    title_right: "",
    sub_title_left: "",
    sub_title_right: "",
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
    description_table_left: "",
    description_table_right: "",
    additionalNotes_left: "",
    additionalNotes_right: "",
    usefullExternalLinks: [""],
    navigationCategory: { id: "" },
    type: "text",
    isShowInHome: false,
    public: true,
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [navigationCategories, setNavigationCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.navigationCategory.id) {
      newErrors["navigationCategory"] = "Category is required. الفئة مطلوبة.";
    }

    if (!formData.nameOrOrganizer_left.trim()) {
      newErrors["nameOrOrganizer_left"] = "Name is required.";
      // Ete left empty e, right-i errori lav e cucadrel
      newErrors["nameOrOrganizer_right"] = "الاسم مطلوب.";
    }

    if (!formData.title_left.trim()) {
      newErrors["title_left"] = "Title is required.";
      newErrors["title_right"] = "العنوان مطلوب.";
    }

    if (!formData.description_table_left.trim()) {
      newErrors["description_table_left"] = "One line description is required.";
      newErrors["description_table_right"] = "الوصف القصير مطلوب.";
    }

    if (schedules.length === 0) {
      newErrors["schedules"] =
        "At least one date is required.  مطلوب إدخال تاريخ واحد على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: MediaFile[] = Array.from(e.target.files).map((f) => {
      let type: MediaFile["type"] = "other";
      if (f.type.startsWith("image/")) type = "photo";
      else if (f.type.startsWith("audio/")) type = "audio";
      else if (f.type === "application/pdf") type = "pdf";
      else if (f.type.startsWith("video/")) type = "video";
      return { file: f, type };
    });
    setMediaFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addSchedule = () =>
    setSchedules((prev) => [
      ...prev,
      {
        year: null,
        month: null,
        dayOfMonth: null,
        dayOfWeek: null,
        startTime: null,
        endTime: null,
      },
    ]);

  const removeSchedule = (index: number) =>
    setSchedules((prev) => prev.filter((_, i) => i !== index));

  const handleScheduleChange = (
    index: number,
    field: keyof Schedule,
    value: any
  ) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const handleCancel = () => {
    setFormData({
      nameOrOrganizer_left: "",
      nameOrOrganizer_right: "",
      title_left: "",
      title_right: "",
      sub_title_left: "",
      sub_title_right: "",
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
      description_table_left: "",
      description_table_right: "",
      additionalNotes_left: "",
      additionalNotes_right: "",
      usefullExternalLinks: [""],
      navigationCategory: { id: "" },
      type: "text",
      isShowInHome: false,
      public: true,
    });
    setMediaFiles([]);
    setSchedules([]);
  };

  const handleCreate = () => {
    handleSubmit();
  };
  const handleSubmit = () => {
    if (!validateForm()) {
      const errors = [
        { en: "Category is required.", ar: "الفئة مطلوبة." },
        { en: "Name is required.", ar: "الاسم مطلوب." },
        { en: "Title is required.", ar: "العنوان مطلوب." },
        {
          en: "One line description is required.",
          ar: "وصف من سطر واحد مطلوب.",
        },
        {
          en: "At least one date is required.",
          ar: "مطلوب إدخال تاريخ واحد على الأقل",
        },
      ];

      const htmlList = `
      <ul style="margin:0; padding-left:1.2em;">
        ${errors
          .map(
            (err) => `
            <li style="text-align:left;">
              <div style="direction:ltr;">${err.en}</div>
              <div style="direction:rtl; text-align:right;">${err.ar}</div>
            </li>
          `
          )
          .join("")}
      </ul>
    `;

      Swal.fire({
        html: `
        <h4 style="text-align:center;">
          <div style="direction:ltr;">Please fill all required fields.</div>
          <div style="direction:rtl;">يرجى ملء جميع الحقول المطلوبة.</div>
        </h4>
        <br/>
        ${htmlList}
      `,
        icon: "error",
        showCloseButton: true,
        confirmButtonColor: "#d33",
        focusConfirm: false,
        confirmButtonText: "OK",
      });

      return;
    }

    const formPayload = new FormData();
    const dtoPayload = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      schedules,
      navigationCategory: formData.navigationCategory.id
        ? { id: formData.navigationCategory.id }
        : null,
    };
    formPayload.append("dto", JSON.stringify(dtoPayload));
    mediaFiles.forEach((mf) => formPayload.append("files", mf.file));

    fetch(`${apiEndpoint}culturalEvent/create`, {
      method: "POST",
      headers: { "api-key": apiKey },
      body: formPayload,
    })
      .then((res) => res.json())
      .then(() =>
        Swal.fire({
          html: `
        <h3 style="text-align:center;">
          <div style="direction:ltr;">The event has been created successfully</div>
          <div style="direction:rtl;"> تم إنشاء الحدث بنجاح.</div>
        </h3>
        <br/>
      `,
          icon: "success",
          confirmButtonColor: "#16285e",
        }).then(() => handleCancel())
      )
      .catch((err) => console.error("Create error:", err));
  };

  useEffect(() => {
    getNavigations();
  }, []);

  function getNavigations() {
    fetch(`${apiEndpoint}navigationCategory/getIsShow`, {
      headers: { accept: "*/*", "api-key": apiKey },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const filtered = data.data.filter(
          (item: any) => item.isShowInNavbar === true
        );
        setNavigationCategories(filtered);
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }

  return (
    <div className="contentParrent">
      <Box width="100%">
        <TextField
          select
          fullWidth
          label="Category فئة"
          value={formData.navigationCategory.id}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              navigationCategory: { id: e.target.value },
            }))
          }
          error={!!errors.navigationCategory}
          helperText={errors.navigationCategory ?? ""}
        >
          {navigationCategories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={4}
        sx={{ flexDirection: { xs: "column", sm: "row" } }}
        mt={2}
      >
        <Box flex={{ xs: "1 1 100%", sm: "1 1 45%" }}>
          {englishFields.map((field) => (
            <Box key={field.key} mb={2}>
              {field.key === "about_left" ? (
                <TextField
                  fullWidth
                  label={field.label}
                  multiline
                  rows={5}
                  value={(formData as any)[field.key]}
                  onChange={(e) =>
                    handleChange(field.key as keyof FormData, e.target.value)
                  }
                  error={!!errors[field.key]}
                  helperText={errors[field.key] ?? ""}
                />
              ) : field.key.startsWith("description_left") ? (
                <Box
                  mt={2}
                  sx={{
                    border: errors[field.key]
                      ? "1px solid red"
                      : "1px solid #ccc",
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <label>{field.label}</label>
                  <Editor
                    apiKey="bdajbbugxu6j05xr99jbswp90otf44nmrpzeztosd69rese0"
                    value={(formData as any)[field.key]}
                    onEditorChange={(content) =>
                      handleChange(field.key as keyof FormData, content)
                    }
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
                  {errors[field.key] && (
                    <p style={{ color: "red", margin: 0 }}>
                      {errors[field.key]}
                    </p>
                  )}
                </Box>
              ) : field.key === "usefullExternalLinks" ? (
                <TextField
                  fullWidth
                  label={field.label}
                  value={(formData as any)[field.key].join(", ")}
                  onChange={(e) =>
                    handleChange(
                      field.key as keyof FormData,
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  error={!!errors[field.key]}
                  helperText={errors[field.key] ?? ""}
                />
              ) : (
                <TextField
                  fullWidth
                  label={field.label}
                  value={(formData as any)[field.key]}
                  onChange={(e) =>
                    handleChange(field.key as keyof FormData, e.target.value)
                  }
                  error={!!errors[field.key]}
                  helperText={errors[field.key] ?? ""}
                />
              )}
            </Box>
          ))}
        </Box>

        <Box flex={{ xs: "1 1 100%", sm: "1 1 45%" }} dir="rtl">
          {arabicFields.map((field) => (
            <Box key={field.key} mb={2}>
              {field.key === "about_right" ? (
                <TextField
                  fullWidth
                  label={field.label}
                  multiline
                  rows={5}
                  value={(formData as any)[field.key]}
                  onChange={(e) =>
                    handleChange(field.key as keyof FormData, e.target.value)
                  }
                  error={!!errors[field.key]}
                  helperText={errors[field.key] ?? ""}
                />
              ) : field.key.startsWith("description_right") ? (
                <Box
                  mt={2}
                  sx={{
                    border: errors[field.key]
                      ? "1px solid red"
                      : "1px solid #ccc",
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <label>{field.label}</label>
                  <Editor
                    apiKey="bdajbbugxu6j05xr99jbswp90otf44nmrpzeztosd69rese0"
                    value={(formData as any)[field.key]}
                    onEditorChange={(content) =>
                      handleChange(field.key as keyof FormData, content)
                    }
                    init={{
                      height: 300,
                      menubar: false,
                      language: "ar",
                      directionality: "rtl",
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
                  {errors[field.key] && (
                    <p style={{ color: "red", margin: 0 }}>
                      {errors[field.key]}
                    </p>
                  )}
                </Box>
              ) : field.key === "usefullExternalLinks" ? (
                <TextField
                  fullWidth
                  label={field.label}
                  value={(formData as any)[field.key].join(", ")}
                  onChange={(e) =>
                    handleChange(
                      field.key as keyof FormData,
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  error={!!errors[field.key]}
                  helperText={errors[field.key] ?? ""}
                />
              ) : (
                <TextField
                  fullWidth
                  label={field.label}
                  value={(formData as any)[field.key]}
                  onChange={(e) =>
                    handleChange(field.key as keyof FormData, e.target.value)
                  }
                  error={!!errors[field.key]}
                  helperText={errors[field.key] ?? ""}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Location Section */}
        <Box width="100%" mt={2} className="location-section">
          <h5>Location الموقع</h5>
          <Box display="flex" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Latitude خط العرض"
              value={formData.latitude}
              onChange={(e) => handleChange("latitude", e.target.value)}
              error={!!errors.latitude}
              helperText={errors.latitude ?? ""}
            />
            <TextField
              fullWidth
              label="Longitude خط الطول"
              value={formData.longitude}
              onChange={(e) => handleChange("longitude", e.target.value)}
              error={!!errors.longitude}
              helperText={errors.longitude ?? ""}
            />
          </Box>
        </Box>

        {/* Media Upload */}
        <Box width="100%">
          <h5>Media Upload رفع وسائط</h5>
          <input
            type="file"
            multiple
            hidden
            id="file-upload"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button variant="outlined" component="span">
              Select Files اختر الملفات
            </Button>
          </label>
          <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
            {mediaFiles.map((mf, i) => (
              <Box
                key={i}
                position="relative"
                border="1px solid #ccc"
                borderRadius={2}
                p={1}
                width={200}
                textAlign="center"
              >
                {mf.type === "photo" ? (
                  <img
                    src={URL.createObjectURL(mf.file)}
                    style={{ width: "100%", height: 120, objectFit: "cover" }}
                  />
                ) : (
                  <p style={{ fontSize: 12 }}>{mf.file.name}</p>
                )}
                <h6 className="mt-2">{mf.type}</h6>
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: 0, right: 0 }}
                  onClick={() => removeFile(i)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Schedules */}
        <Box width="100%" mt={2}>
          <h5>Date التاريخ</h5>
          {errors.schedules && (
            <p style={{ color: "red", margin: 0 }}>{errors.schedules}</p>
          )}
          {schedules.map((sch, i) => (
            <Box key={i} display="flex" gap={1} alignItems="center" mb={1}>
              <TextField
                label="Year السنة"
                type="number"
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
              {/* Month */}
              <TextField
                select
                label="Month الشهر"
                value={sch.month ?? ""}
                onChange={(e) =>
                  handleScheduleChange(
                    i,
                    "month",
                    e.target.value === "" ? null : +e.target.value
                  )
                }
              >
                <MenuItem value="">None لا شيء</MenuItem>
                {Array.from({ length: 12 }, (_, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>
                    {
                      [
                        "January   كانون الثاني ",
                        "February شباط",
                        "March آذار",
                        "April نيسان",
                        "May أيار",
                        "June حزيران",
                        "July تموز",
                        "August آب",
                        "September أيلول",
                        "October تشرين الأول",
                        "November تشرين الثاني",
                        "December كانون الأول",
                      ][idx]
                    }
                  </MenuItem>
                ))}
              </TextField>

              {/* Day of Month */}
              <TextField
                select
                label="Day of Month التاريخ في الشهر"
                value={sch.dayOfMonth ?? ""}
                onChange={(e) =>
                  handleScheduleChange(
                    i,
                    "dayOfMonth",
                    e.target.value === "" ? null : +e.target.value
                  )
                }
              >
                <MenuItem value="">None لا شيء</MenuItem>
                {Array.from({ length: 31 }, (_, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>
                    {idx + 1}
                  </MenuItem>
                ))}
              </TextField>

              {/* Day of Week */}
              <TextField
                select
                label="Day of Week اليوم في الاسبوع"
                value={sch.dayOfWeek ?? ""}
                onChange={(e) =>
                  handleScheduleChange(
                    i,
                    "dayOfWeek",
                    e.target.value === "" ? null : +e.target.value
                  )
                }
              >
                <MenuItem value="">None لا شيء</MenuItem>
                {[
                  "Monday الاثنين",
                  "Tuesday الثلاثاء",
                  "Wednesday الأربعاء",
                  "Thursday الخميس",
                  "Friday الجمعة",
                  "Saturday السبت",
                  "Sunday الأحد",
                ].map((d, idx) => (
                  <MenuItem key={idx} value={idx + 1}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Start Time وقت البدء"
                type="time"
                value={sch.startTime ?? ""}
                onChange={(e) =>
                  handleScheduleChange(i, "startTime", e.target.value || null)
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  inputProps: {
                    placeholder: "--:--",
                  },
                }}
                defaultValue=""
              />

              <TextField
                label="End Time وقت الانتهاء"
                type="time"
                value={sch.endTime ?? ""}
                onChange={(e) =>
                  handleScheduleChange(i, "endTime", e.target.value || null)
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  inputProps: {
                    placeholder: "--:--",
                  },
                }}
                defaultValue=""
              />
              

              <Button color="error" onClick={() => removeSchedule(i)}>
                X
              </Button>
            </Box>
          ))}
          <Button onClick={addSchedule}>Add Date إضافة تاريخ</Button>
        </Box>

        {/* Footer */}
        <Box
          width="100%"
          display="flex"
          justifyContent="flex-start"
          gap={2}
          mt={2}
        >
          <Button variant="outlined" onClick={handleCancel}>
            Cancel ( إلغاء )
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Create ( إنشاء )
          </Button>
        </Box>
      </Box>
    </div>
  );
}
