// src/utils/updateHandler.ts
export const handleUpdate = async (
  combinedEvent: any,
  files: File[],
  schedules: any[],
  id: number,
  apiKey: string,
  apiEndpoint: string,
  pdfImage?: File | null
) => {
  // Clean up schedule data
  if (schedules) {
    schedules.forEach((item) => {
      for (const key in item) {
        if (item[key] === "" || item[key] === undefined) {
          item[key] = null;
        }
      }
    });
  }

  const payload = new FormData();
  files.forEach((file) => payload.append("files", file));
  if (pdfImage) payload.append("pdfImage", pdfImage);
  payload.append("dto", JSON.stringify(combinedEvent));

  try {
    const response = await fetch(
      `${apiEndpoint}culturalEvent/update/${id}?replaceOldFile=true`,
      {
        method: "PUT",
        headers: {
          "api-key": apiKey,
        },
        body: payload,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update event");
    }

    return await response.json();
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
};
