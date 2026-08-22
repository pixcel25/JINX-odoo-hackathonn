import { AttendanceRecord } from "../models";

export const todayAttendance: AttendanceRecord | null = null;

export async function checkInAttendance(
  hasRegisteredToday: boolean,
): Promise<AttendanceRecord> {
  if (hasRegisteredToday) {
    throw new Error("Attendance has already been registered for today.");
  }

  return {
    id: "attendance-today",
    date: "23 Aug",
    checkIn: "09:07 AM",
    checkOut: "",
    duration: "4h 32m",
    status: "present",
  };
}

export async function checkOutAttendance(isCheckedIn: boolean): Promise<AttendanceRecord> {
  if (!isCheckedIn) {
    throw new Error("This attendance day has already been checked out.");
  }

  return {
    id: "attendance-today",
    date: "23 Aug",
    checkIn: "09:07 AM",
    checkOut: "05:41 PM",
    duration: "8h 34m",
    status: "present",
  };
}