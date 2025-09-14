import "./../assets/home/culturalEventDetails.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "./../assets/home/home.css";
import "./../assets/culturalEvents/culturalEvents.css";
import EditEventModal from "./EditEventModal";

type Media = {
  id: number;
  url: string;
  name: string;
  type: "audio" | "video" | "pdf" | "photo" | "word" | "excel";
};

export default function CulturalEventDetails() {
  const location = useLocation();
  const apiEndpointForUrl = import.meta.env.VITE_API_ENDPOINT_FOR_URL;
  const apiKey = import.meta.env.VITE_API_KEY;
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const month = [
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
    "December",
  ];

  const queryParams = new URLSearchParams(location.search);
  const id = Number(queryParams.get("id"));

  const [event, setEvent] = useState<any>(null);
  const [phase, setPhase] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [openModal, setOpenModal] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const refs: Record<string, any> = {
    info: useRef(null),
    text: useRef(null),
    images: useRef(null),
    process: useRef(null),
    tools: useRef(null),
    location: useRef(null),
  };

  const position: LatLngExpression | null =
    event?.latitude && event?.longitude
      ? [event.latitude, event.longitude]
      : null;

  function getEventsById(id: number) {
    fetch(`${apiEndpoint}culturalEvent/getEventsById/${id}`, {
      headers: { accept: "*/*", "api-key": `${apiKey}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEvent(data.data);
        setPhase(data.data.navigationCategory.name);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }

  function getMenuItems() {
    fetch(`${apiEndpoint}navigationCategory/getAll`, {
      headers: { accept: "*/*", "api-key": `${apiKey}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMenuItems(data.data);
      })
      .catch((err) => console.error("Error fetching menu items:", err));
  }

  useEffect(() => {
    getEventsById(id);
    getMenuItems();
  }, [id]);

  const handleUpdateSuccess = (updatedData: any) => {
    setEvent(updatedData);
    setOpenModal(false);
  };

  const media = (event?.mediaFiles || []) as Media[];

  const heroPhoto: Media | undefined = useMemo(() => {
    const photos = media.filter((m) => m.type === "photo");
    return (
      photos.find((p) =>
        (p.name || "").toLowerCase().match(/^(hero|cover)|\b(hero|cover)\b/)
      ) || photos[0]
    );
  }, [media]);

  const mediaBuckets = useMemo(() => {
    const photos = media.filter(
      (m) => m.type === "photo" && m.id !== heroPhoto?.id
    );
    const videos = media.filter((m) => m.type === "video");
    const audios = media.filter((m) => m.type === "audio");
    const docs = media.filter((m) => ["pdf", "word", "excel"].includes(m.type));
    return { photos, videos, docs, audios };
  }, [media, heroPhoto]);

  function MetaPair({
    label,
    leftValue,
    rightValue,
  }: {
    label: string;
    leftValue?: string | React.ReactNode;
    rightValue?: string | React.ReactNode;
  }) {
    const isNonEmpty = (value?: string | React.ReactNode) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim() !== "";
      return true;
    };

    const hasLeft = isNonEmpty(leftValue);
    const hasRight = isNonEmpty(rightValue);

    if (!hasLeft && !hasRight) return null;

    return (
      <div className="meta-pair">
        <b>{label}</b>
        <div className="meta-pair-child container">
          {hasRight && (
            <span
              className={
                leftValue ? "rtl col-sm-6 rtlSp" : "rtl col-sm-12 rtlSpC"
              }
              dir="rtl"
            >
              {rightValue}
            </span>
          )}
          {rightValue && leftValue ? (
            <div className="lineBetweenCard"></div>
          ) : (
            ""
          )}
          {hasLeft && (
            <span
              className={
                rightValue ? "ltr col-sm-6 ltrSp" : "ltr col-sm-12 ltrSpC"
              }
            >
              {leftValue}
            </span>
          )}
        </div>
      </div>
    );
  }

  function FileCard({ m }: { m: Media & { pdfImageUrl?: string } }) {
    const url = `${apiEndpointForUrl}${m.url}`;
    const pdfImage = (m as any).pdfImageUrl
      ? `${apiEndpointForUrl}${(m as any).pdfImageUrl}`
      : null;

    if (m.type === "photo")
      return (
        <div
          className="file-card photo"
          onClick={() => window.open(url, "_blank")}
        >
          <div className="photo-wrapper">
            <img src={url} alt={m.name} />
          </div>
        </div>
      );

    if (m.type === "video")
      return (
        <div className="file-card video">
          <video src={url} controls />
        </div>
      );

    if (m.type === "audio")
      return (
        <div className="file-card audio">
          <audio src={url} controls />
        </div>
      );

    if (m.type === "pdf") {
      if (pdfImage) {
        return (
          <div
            className="file-card pdf pdfCards"
            onClick={() => window.open(url, "_blank")}
            style={{ display: "block" }}
          >
            <div className="photo-wrapper">
              <img src={pdfImage} alt={m.name} title="Click to view" />
            </div>
            <div className="mt-2">
              <span>PDF</span>
            </div>
          </div>
        );
      } else {
        return (
          <div
            className="file-card doc"
            onClick={() => window.open(url, "_blank")}
          >
            <div className="doc-box">PDF</div>
          </div>
        );
      }
    }

    return (
      <div className="file-card doc" onClick={() => window.open(url, "_blank")}>
        <div className="doc-box">{m.type.toUpperCase()}</div>
      </div>
    );
  }

  function FileGroup({
    title,
    items,
    groupKey,
  }: {
    title: string;
    items: Media[];
    groupKey: string;
  }) {
    if (items.length === 0) return null;
    const expanded = expandedGroups[groupKey];
    const visible = expanded ? items : items.slice(0, 5);

    return (
      <div className="files-group">
        <h4>{title}</h4>
        <div className="files-grid">
          {visible.map((m) => (
            <FileCard key={m.id} m={m} />
          ))}
        </div>
        {items.length > 5 && (
          <button
            className="toggle-btn"
            onClick={() =>
              setExpandedGroups((prev) => ({ ...prev, [groupKey]: !expanded }))
            }
          >
            {expanded ? "Show less" : "Load more"}
          </button>
        )}
      </div>
    );
  }

  const infoValues = [
    event?.category_left || event?.category_right,
    event?.country_left || event?.country_right,
    event?.city_left || event?.city_right,
    event?.usefullExternalLinks?.length ? event.usefullExternalLinks : null,
    event?.hostPlace_left || event?.hostPlace_right,
    event?.materialsMedium_left || event?.materialsMedium_right,
  ].filter(Boolean);

  return (
    <div className="event-layout">
      {/* MAIN CONTENT */}
      <div className="event-main mt-5">
        {/* NAME */}
        <div className="event-header">
          {(event?.nameOrOrganizer_left || event?.nameOrOrganizer_right) && (
            <h3 className="event-name container">
              {event?.nameOrOrganizer_right && (
                <span
                  className={
                    event?.nameOrOrganizer_left
                      ? "rtl col-sm-6 rtlSp"
                      : "rtl col-sm-12 rtlSpC"
                  }
                  dir="rtl"
                >
                  {event.nameOrOrganizer_right}
                </span>
              )}
              {event?.nameOrOrganizer_right && event?.nameOrOrganizer_left ? (
                <div className="lineBetween"></div>
              ) : (
                ""
              )}
              {event?.nameOrOrganizer_left && (
                <span
                  className={
                    event?.nameOrOrganizer_right
                      ? "ltr col-sm-6 ltrSp"
                      : "ltr col-sm-12 ltrSpC"
                  }
                >
                  {event.nameOrOrganizer_left}
                </span>
              )}
            </h3>
          )}

          <div className="cr1 mt-5">
            <div className="hero ">
              <h3>DOCUMENTS FROM {phase}</h3>
            </div>
            {/* EDIT BUTTON */}
            <div>
              <button type="button" onClick={() => setOpenModal(true)}>
                Edit Event
              </button>
         
            </div>
          </div>

          {(event?.title_left || event?.title_right) && (
            <h5 className="event-title container">
              {event?.title_right && (
                <span
                  className={
                    event?.title_left
                      ? "rtl col-sm-6 rtlSp"
                      : "rtl col-sm-12 rtlSpC"
                  }
                  dir="rtl"
                >
                  {event.title_right}
                </span>
              )}
              {event?.nameOrOrganizer_right && event?.nameOrOrganizer_left ? (
                <div className="lineBetween"></div>
              ) : (
                ""
              )}
              {event?.title_left && (
                <span
                  className={
                    event?.title_right
                      ? "ltr col-sm-6 ltrSp"
                      : "ltr col-sm-12 ltrSpC"
                  }
                >
                  {event.title_left}
                </span>
              )}
            </h5>
          )}
        </div>

        {/* HERO */}
        {heroPhoto && (
          <div
            className="hero mt-5"
            onClick={() =>
              window.open(`${apiEndpointForUrl}${heroPhoto.url}`, "_blank")
            }
          >
            <img
              src={`${apiEndpointForUrl}${heroPhoto.url}`}
              alt={heroPhoto.name}
            />
          </div>
        )}

        {/* INFO TWO-COLUMN */}

        <section ref={refs.info} className="section sectionTwice">
          {infoValues.length > 1 && <div className="line"></div>}

          <div className={infoValues.length > 1 ? "info-grid " : "info-flow"}>
            <MetaPair
              label="Category"
              leftValue={event?.category_left}
              rightValue={event?.category_right}
            />

            <MetaPair
              label="Country"
              leftValue={event?.country_left}
              rightValue={event?.country_right}
            />

            <MetaPair
              label="City"
              leftValue={event?.city_left}
              rightValue={event?.city_right}
            />

            <MetaPair
              label="Usefull External Links"
              leftValue={
                event?.usefullExternalLinks?.length
                  ? event.usefullExternalLinks.map(
                      (link: string, i: number) => (
                        <div key={i}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link}
                          </a>
                        </div>
                      )
                    )
                  : undefined
              }
              rightValue={null}
            />

            <MetaPair
              label="Host Place"
              leftValue={event?.hostPlace_left}
              rightValue={event?.hostPlace_right}
            />

            <MetaPair
              label="Materials"
              leftValue={event?.materialsMedium_left}
              rightValue={event?.materialsMedium_right}
            />
          </div>
        </section>

        {/* LONG TEXTS */}
        {(event?.about_left || event?.about_right) && (
          <section className="section">
            {event.about_right && (
              <div className="desc rtl" dir="rtl">
                {event.about_right}
              </div>
            )}
            {event.about_left && <div className="desc">{event.about_left}</div>}
          </section>
        )}

        {(event?.description_left || event?.description_right) && (
          <section ref={refs.text} className="section">
            {event.description_right && (
              <div
                className="desc rtl"
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: event.description_right }}
              />
            )}
            {event.description_left && (
              <div
                className="desc"
                dangerouslySetInnerHTML={{ __html: event.description_left }}
              />
            )}
          </section>
        )}

        {(event?.additionalNotes_left || event?.additionalNotes_right) && (
          <section className="section">
            {event.additionalNotes_right && (
              <div className="desc rtl" dir="rtl">
                {event.additionalNotes_right}
              </div>
            )}
            {event.additionalNotes_left && (
              <div className="desc">{event.additionalNotes_left}</div>
            )}
          </section>
        )}

        {/* IMAGES */}
        {mediaBuckets.photos?.length ? (
          <section ref={refs.images} className="section">
            <FileGroup
              title="Images"
              items={mediaBuckets.photos}
              groupKey="photos"
            />
          </section>
        ) : (
          ""
        )}

        {/* PROCESS */}
        {event?.schedules?.length ? (
          <section ref={refs.process} className="section">
            {event.schedules.map((sch: any, i: number) => {
              const parts: string[] = [];

              // Day + Month + Year
              let datePart = "";
              if (sch.dayOfMonth !== null) {
                datePart += sch.dayOfMonth + " ";
              }
              if (sch.month !== null) {
                datePart += month[sch.month - 1] + " ";
              }
              if (sch.year !== null) {
                datePart += sch.year;
              }
              if (datePart) {
                parts.push(datePart.trim());
              }

              // Weekday
              if (sch.dayOfWeek !== null) {
                parts.push(weekdays[sch.dayOfWeek - 1]);
              }

              // Time interval
              if (sch.startTime && sch.endTime) {
                const formatTime = (t: string) => t.slice(0, 5); // HH:mm
                parts.push(
                  `${formatTime(sch.startTime)} - ${formatTime(sch.endTime)}`
                );
              }

              return <div key={i}>{parts.join(" / ")}</div>;
            })}
          </section>
        ) : (
          ""
        )}

        {/* ATTACHMENTS */}
        {(mediaBuckets.videos.length ||
          mediaBuckets.docs.length ||
          mediaBuckets.audios.length) > 0 ? (
          <section ref={refs.tools} className="section">
            <FileGroup
              title="Videos"
              items={mediaBuckets.videos}
              groupKey="videos"
            />
            <FileGroup
              title="Documents"
              items={mediaBuckets.docs}
              groupKey="docs"
            />
            <FileGroup
              title="Audio"
              items={mediaBuckets.audios}
              groupKey="audios"
            />
          </section>
        ) : (
          ""
        )}

        {/* MAP */}
        {position && (
          <section ref={refs.location} className="section">
            <MapContainer
              center={position}
              zoom={13}
              className="leaflet-container"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position}>
                <Popup>
                  Event location: {event.latitude}, {event.longitude}
                </Popup>
              </Marker>
            </MapContainer>
          </section>
        )}
      </div>

      {/* EDIT MODAL */}
      <EditEventModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        row={event}
        onSave={handleUpdateSuccess}
        menuItems={menuItems}
        apiKey={apiKey}
        apiEndpoint={apiEndpoint}
      />
    </div>
  );
}
