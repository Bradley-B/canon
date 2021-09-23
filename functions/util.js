const dateDisplayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' };

const parseIfString = (obj) => {
  if (typeof obj === 'string') {
    return JSON.parse(obj);
  }
  return obj;
}

export const compareDate = (dateA, dateB) => {
  dateA = parseIfString(dateA);
  dateB = parseIfString(dateB);
  return new Date(dateB) - new Date(dateA);
}

export const formatDate = (date) => {
  date = parseIfString(date);
  return new Date(date).toLocaleDateString("en-US", dateDisplayOptions);
}

export const serializeDateValues = (object) => {
  for (const [key, value] of Object.entries(object)) {
    if (value instanceof Date ) {
      object[key] = JSON.stringify(value);
    }
  }
}