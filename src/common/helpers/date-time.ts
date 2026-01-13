function randomFutureDate(daysAhead = 30) {
  const randomDays = Math.floor(Math.random() * daysAhead) + 1;
  const date = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  date.setHours(8 + Math.floor(Math.random() * 8));
  return date;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
export { randomFutureDate, addMinutes };
