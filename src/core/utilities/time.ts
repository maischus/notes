export function formatDate(date: number) {
  const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: "auto" });
  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  const elapsedTime = Date.now() - date;

  if (elapsedTime < minute) {
    return rtf.format(-Math.round(elapsedTime / second), "seconds");
  } else if (elapsedTime < hour) {
    return rtf.format(-Math.round(elapsedTime / minute), "minute");
  } else if (elapsedTime < day) {
    return rtf.format(-Math.round(elapsedTime / hour), "hour");
  } else if (elapsedTime < week) {
    return rtf.format(-Math.round(elapsedTime / day), "day");
  } else {
    return new Intl.DateTimeFormat(navigator.language).format(date);
  }
}