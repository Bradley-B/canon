const dateDisplayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", dateDisplayOptions);
