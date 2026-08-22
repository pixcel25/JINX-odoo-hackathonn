export type LeaveType = "annual" | "sick" | "casual" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveRequestFormValues = {
  email: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
};

export type ExistingLeave = {
  id: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
};

export type LeaveRequest = LeaveRequestFormValues & {
  id: string;
  status: LeaveStatus;
  timeOffType?: string;
  days?: number;
  reviewerComment?: string;
};