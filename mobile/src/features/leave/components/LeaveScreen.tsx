import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LeaveRequestForm } from "./LeaveRequestForm";
import { ExistingLeave, LeaveRequest } from "../models";

const initialLeaves: ExistingLeave[] = [
  { id: "approved-1", startDate: "2026-08-26", endDate: "2026-08-27", status: "approved" },
  { id: "pending-1", startDate: "2026-09-03", endDate: "2026-09-03", status: "pending" },
];

export function LeaveScreen() {
  const [leaves, setLeaves] = useState<ExistingLeave[]>(initialLeaves);

  const handleSubmitted = (request: LeaveRequest) => {
    setLeaves((currentLeaves) => [
      ...currentLeaves,
      {
        id: request.id,
        startDate: request.startDate,
        endDate: request.endDate,
        status: request.status,
      },
    ]);
  };

  return (
    <View>
      <Text style={styles.title}>Leave requests</Text>
      <Text style={styles.subtitle}>Plan time away with confidence.</Text>

      <Text style={styles.sectionTitle}>New request</Text>
      <LeaveRequestForm existingLeaves={leaves} onSubmitted={handleSubmitted} />

      <Text style={styles.sectionTitle}>Your requests</Text>
      <View style={styles.requestCard}>
        {leaves.map((leave) => (
          <View key={leave.id} style={styles.requestRow}>
            <View>
              <Text style={styles.requestDates}>{leave.startDate} to {leave.endDate}</Text>
              <Text style={styles.requestMeta}>Leave request</Text>
            </View>
            <Text style={[styles.requestStatus, leave.status === "approved" ? styles.approved : styles.pending]}>
              {leave.status}
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
  approved: {
    color: "#087451",
    backgroundColor: "#e6f8f0",
  },
  pending: {
    color: "#9a5a09",
    backgroundColor: "#fff4e3",
  },
});