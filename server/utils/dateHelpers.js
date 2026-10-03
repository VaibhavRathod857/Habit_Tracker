export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateString = (dateObj) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysAgoString = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDateString(d);
};

export const getDayOfWeekIndex = (dateStr) => {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getDay();
};

export const getDateRange = (startDateStr, endDateStr) => {
  const dates = [];
  const curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (curr <= end) {
    dates.push(formatDateString(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

export const getWeekStartEnd = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  // Monday as start of week (0 is Sunday, so if day is 0, diff is -6)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    weekStart: formatDateString(monday),
    weekEnd: formatDateString(sunday),
  };
};
