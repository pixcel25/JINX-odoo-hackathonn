export type AttendanceStatus = "present" | "late" | "leave";

export type AttendanceRecord = {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: AttendanceStatus;
};