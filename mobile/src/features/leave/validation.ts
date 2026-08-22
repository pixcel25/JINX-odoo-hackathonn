import { ExistingLeave, LeaveRequestFormValues } from "./models";

export type LeaveField = keyof LeaveRequestFormValues;
export type LeaveValidationErrors = Partial<Record<LeaveField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validateLeaveRequest(
  values: LeaveRequestFormValues,
  existingLeaves: ExistingLeave[],
): LeaveValidationErrors {
  const errors: LeaveValidationErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Work email is required.";
  } else if (email.length > 254 || !emailPattern.test(email)) {
    errors.email = "Enter a valid work email address.";
  }

  if (!values.leaveType) {
    errors.leaveType = "Choose a leave type.";
  }

  const startDate = parseDate(values.startDate);
  const endDate = parseDate(values.endDate);

  if (!startDate) {
    errors.startDate = "Use a real date in YYYY-MM-DD format.";
  }

  if (!endDate) {
    errors.endDate = "Use a real date in YYYY-MM-DD format.";
  }

  if (startDate && endDate && startDate > endDate) {
    errors.endDate = "End date must be on or after the start date.";
  }

  if (startDate && endDate && startDate <= endDate) {
    const hasConflict = existingLeaves.some((leave) => {
      if (leave.status === "rejected" || leave.status === "cancelled") {
        return false;
      }

      const existingStart = parseDate(leave.startDate);
      const existingEnd = parseDate(leave.endDate);

      return Boolean(
        existingStart &&
          existingEnd &&
          startDate <= existingEnd &&
          endDate >= existingStart,
      );
    });

    if (hasConflict) {
      errors.startDate = "These dates overlap an existing leave request.";
      errors.endDate = "Choose dates that do not overlap existing leave.";
    }
  }

  const reason = values.reason.trim();
  if (!reason) {
    errors.reason = "Add a short reason for your request.";
  } else if (reason.length > 500) {
    errors.reason = "Reason must be 500 characters or fewer.";
  }

  return errors;
}

function parseDate(value: string): Date | null {
  if (!datePattern.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}