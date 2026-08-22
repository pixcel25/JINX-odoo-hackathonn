import {
  ExistingLeave,
  LeaveRequest,
  LeaveRequestFormValues,
} from "../models";
import {
  LeaveValidationErrors,
  validateLeaveRequest,
} from "../validation";

export class LeaveRequestValidationError extends Error {
  constructor(public readonly fieldErrors: LeaveValidationErrors) {
    super("The leave request contains invalid fields.");
    this.name = "LeaveRequestValidationError";
  }
}

export async function createLeaveRequest(
  values: LeaveRequestFormValues,
  existingLeaves: ExistingLeave[],
): Promise<LeaveRequest> {
  const fieldErrors = validateLeaveRequest(values, existingLeaves);

  if (Object.keys(fieldErrors).length > 0) {
    throw new LeaveRequestValidationError(fieldErrors);
  }

  return {
    ...values,
    email: values.email.trim(),
    reason: values.reason.trim(),
    id: `leave-${Date.now()}`,
    status: "pending",
  };
}