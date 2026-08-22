import { apiRequest } from "../../../auth/authService";
import { AttendanceRecord, AttendanceSummary } from "../models";

type AttendanceResponse = {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
};

type AttendanceRecordResponse = {
  record: AttendanceRecord;
};

export async function getAttendance(token: string): Promise<AttendanceResponse> {
  return apiRequest<AttendanceResponse>("/hr/attendance/", token);
}

export async function checkInAttendance(token: string): Promise<AttendanceRecord> {
  const response = await apiRequest<AttendanceRecordResponse>(
    "/hr/attendance/check-in/",
    token,
    { method: "POST", body: JSON.stringify({}) },
  );
  return response.record;
}

export async function checkOutAttendance(token: string): Promise<AttendanceRecord> {
  const response = await apiRequest<AttendanceRecordResponse>(
    "/hr/attendance/check-out/",
    token,
    { method: "POST", body: JSON.stringify({}) },
  );
  return response.record;
}