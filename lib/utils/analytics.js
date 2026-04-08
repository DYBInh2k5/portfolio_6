export const trackEvent = ({ event, category, action, label, value, ...rest }) => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    event_category: category,
    event_action: action,
    event_label: label,
    value,
    ...rest,
  });
};
