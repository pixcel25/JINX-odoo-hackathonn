import { AttendanceRecord } from "../models";

export const todayAttendance: AttendanceRecord | null = null;
let activeCheckInTime = "";

function currentAttendanceTime() {
  const now = new Date();
  return {
    date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

export async function checkInAttendance(
  hasRegisteredToday: boolean,
): Promise<AttendanceRecord> {
  if (hasRegisteredToday) {
    throw new Error("Attendance has already been registered for today.");
  }

  const currentTime = currentAttendanceTime();
  activeCheckInTime = currentTime.time;
  return {
    id: "attendance-today",
    date: currentTime.date,
    checkIn: currentTime.time,
    checkOut: "",
    duration: "4h 32m",
    status: "present",
  };
}

export async function checkOutAttendance(isCheckedIn: boolean): Promise<AttendanceRecord> {
  if (!isCheckedIn) {
    throw new Error("This attendance day has already been checked out.");
  }

  const currentTime = currentAttendanceTime();
  return {
    id: "attendance-today",
    date: currentTime.date,
    checkIn: activeCheckInTime || currentTime.time,
    checkOut: currentTime.time,
    duration: "8h 34m",
    status: "present",
  };
}