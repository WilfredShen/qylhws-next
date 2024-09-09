import dayjs from "dayjs";

export function formatDateTime(value: string | number | Date): string {
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
}

export function formatDate(value: string | number | Date): string {
  return dayjs(value).format("YYYY-MM-DD");
}

export function formatTime(value: string | number | Date): string {
  return dayjs(value).format("HH:mm:ss");
}
