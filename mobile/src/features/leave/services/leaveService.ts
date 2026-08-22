import {
  ExistingLeave,
  LeaveRequest,
  LeaveRequestFormValues,
} from "../models";
import {
  LeaveValidationErrors,
  validateLeaveRequest,
} from "../validation";
import { apiRequest } from "../../../auth/authService";

export class LeaveRequestValidationError extends Error {
  constructor(public readonly fieldErrors: LeaveValidationErrors) {
    super("The leave request contains invalid fields.");
    this.name = "LeaveRequestValidationError";
  }
}

export async function createLeaveRequest(
  values: LeaveRequestFormValues,
  existingLeaves: ExistingLeave[],
  token: string,
): Promise<LeaveRequest> {
  const fieldErrors = validateLeaveRequest(values, existingLeaves);

  if (Object.keys(fieldErrors).length > 0) {
    throw new LeaveRequestValidationError(fieldErrors);
  }

  const response = await apiRequest<{ request: LeaveRequest }>(
    "/hr/leave-requests/",
    token,
    {
      method: "POST",
      body: JSON.stringify({
        leaveType: values.leaveType,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason.trim(),
      }),
    },
  );
  return response.request;
}

export async function getLeaveRequests(token: string): Promise<LeaveRequest[]> {
  const response = await apiRequest<{ requests: LeaveRequest[] }>(
    "/hr/leave-requests/",
    token,
  );
  return response.requests;
}