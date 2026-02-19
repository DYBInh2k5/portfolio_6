const dateFormat = (date) => {
  if (!date) return "";

  let normalizedDate = date;

  // Firestore Timestamp support
  if (typeof date?.toDate === "function") {
    normalizedDate = date.toDate();
  } else if (!(date instanceof Date)) {
    normalizedDate = new Date(date);
  }

  if (Number.isNaN(normalizedDate.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(normalizedDate);
};

export default dateFormat;
