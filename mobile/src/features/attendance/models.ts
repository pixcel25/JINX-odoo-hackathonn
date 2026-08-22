export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "half_day"
  | "on_leave";

export type AttendanceRecord = {
  id: string;
  userId?: string;
  date: string;
  dateLabel?: string;
  checkIn: string;
  checkOut: string;
  checkInAt?: string;
  checkOutAt?: string | null;
  duration: string;
  status: AttendanceStatus;
  statusLabel?: string;
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  half_day: number;
  on_leave: number;
};