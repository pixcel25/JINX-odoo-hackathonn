import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LeaveRequestForm } from "./LeaveRequestForm";
import { ExistingLeave, LeaveRequest } from "../models";
import { getLeaveRequests } from "../services/leaveService";
import { Employee } from "../../../auth/authService";

export function LeaveScreen({ employee }: { employee: Employee }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getLeaveRequests(employee.token)
      .then((loadedRequests) => {
        if (isMounted) {
          setRequests(loadedRequests);
          setError("");
        }
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : "We could not load your leave requests.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employee.token]);

  const handleSubmitted = (request: LeaveRequest) => {
    setRequests((currentRequests) => [request, ...currentRequests]);
  };

  const existingLeaves: ExistingLeave[] = requests.map((request) => ({
    id: request.id,
    startDate: request.startDate,
    endDate: request.endDate,
    status: request.status,
  }));

  return (
    <View>
      <Text style={styles.title}>Leave requests</Text>
      <Text style={styles.subtitle}>Plan time away with confidence.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>New request</Text>
      <LeaveRequestForm
        email={employee.email}
        existingLeaves={existingLeaves}
        onSubmitted={handleSubmitted}
        token={employee.token}
      />

      <Text style={styles.sectionTitle}>Your requests</Text>
      <View style={styles.requestCard}>
        {isLoading ? <Text style={styles.emptyText}>Loading requests...</Text> : null}
        {!isLoading && requests.length === 0 ? <Text style={styles.emptyText}>No leave requests yet.</Text> : null}
        {requests.map((request) => (
          <View key={request.id} style={styles.requestRow}>
            <View>
              <Text style={styles.requestDates}>{request.startDate} to {request.endDate}</Text>
              <Text style={styles.requestMeta}>{request.timeOffType ?? request.leaveType} {request.reason ? `- ${request.reason}` : ""}</Text>
            </View>
            <Text style={[styles.requestStatus, request.status === "approved" ? styles.approved : styles.pending]}>
              {request.status}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#111c24",
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    color: "#65737a",
    fontSize: 16,
  },
  error: {
    marginTop: 12,
    color: "#b4232b",
    fontSize: 13,
  },
  sectionTitle: {
    marginTop: 30,
    marginBottom: 14,
    color: "#111c24",
    fontSize: 21,
    fontWeight: "700",
  },
  requestCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e8e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  requestRow: {
    minHeight: 70,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#edf1ef",
  },
  requestDates: {
    color: "#26343a",
    fontSize: 14,
    fontWeight: "600",
  },
  requestMeta: {
    marginTop: 4,
    color: "#7a878c",
    fontSize: 12,
  },
  requestStatus: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptyText: {
    padding: 18,
    color: "#748087",
    fontSize: 13,
  },
  approved: {
    color: "#087451",
    backgroundColor: "#e6f8f0",
  },
  pending: {
    color: "#9a5a09",
    backgroundColor: "#fff4e3",
  },
});