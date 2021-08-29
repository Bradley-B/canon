const dateDisplayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

export const formatDate = (date) => {
  if (typeof date === 'string') {
    date = JSON.parse(date);
  }
  return new Date(date).toLocaleDateString("en-US", dateDisplayOptions);
}
