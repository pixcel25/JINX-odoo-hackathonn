import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AttendanceRecord, AttendanceSummary } from "../models";
import { FeedbackBanner } from "../../../shared/components/FeedbackBanner";

type AttendanceScreenProps = {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
  isLoading: boolean;
  error: string | null;
};

export function AttendanceScreen({ records, summary, isLoading, error }: AttendanceScreenProps) {
  const currentDate = new Date();
  const selectedDay = currentDate.getDate();
  const monthLabel = currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const days = createMonthDays(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <View>
      <ScreenHeading title="Attendance" subtitle={monthLabel} />
      {error ? <FeedbackBanner kind="error" message={error} /> : null}
      {isLoading ? <ActivityIndicator color="#087451" /> : null}

      <View style={styles.calendarCard}>
        <View style={styles.weekRow}>
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {days.map((day, index) => (
            <View key={`${day ?? "empty"}-${index}`} style={styles.dayCell}>
              {day ? (
                <View style={[styles.dayNumber, day === selectedDay && styles.selectedDay]}>
                  <Text style={[styles.dayText, day === selectedDay && styles.selectedDayText]}>{day}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label="Present" value={String(summary.present)} tone="green" />
        <SummaryCard label="Late" value={String(summary.late)} tone="red" />
        <SummaryCard label="Other" value={String(summary.half_day + summary.on_leave)} tone="blue" />
      </View>

      <Text style={styles.sectionTitle}>Recent Records</Text>
      <View style={styles.recordsCard}>
        {records.length ? records.map((record) => (
          <View key={record.id} style={styles.recordRow}>
            <Text style={styles.recordDate}>{record.dateLabel ?? record.date}</Text>
            <Text style={styles.recordValue}>{record.checkIn || "-:-"}</Text>
            <Text style={styles.recordValue}>{record.checkOut || "-:-"}</Text>
            <Text style={styles.recordValue}>{record.duration}</Text>
            <View style={[styles.statusBadge, record.status !== "present" && styles.lateBadge]}>
              <Text style={[styles.statusLabel, record.status !== "present" && styles.lateLabel]}>
                {record.statusLabel ?? record.status}
              </Text>
            </View>
          </View>
        )) : (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No attendance records yet.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ScreenHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.headingTitle}>{title}</Text>
      <Text style={styles.headingSubtitle}>{subtitle}</Text>
    </View>
  );
}

function createMonthDays(year: number, month: number): Array<number | null> {
  const firstDay = new Date(year, month, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const days: Array<number | null> = Array.from({ length: mondayOffset }, () => null);

  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day += 1) {
    days.push(day);
  }

  return days;
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "green" | "red" | "blue" }) {
  return (
    <View style={[styles.summaryCard, styles[`${tone}Summary`]]}>
      <Text style={[styles.summaryLabel, styles[`${tone}Text`]]}>{label}</Text>
      <Text style={[styles.summaryValue, styles[`${tone}Text`]]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  headingTitle: {
    color: "#101b23",
    fontSize: 30,
    fontWeight: "700",
  },
  headingSubtitle: {
    color: "#0a805c",
    fontSize: 17,
    fontWeight: "600",
  },
  calendarCard: {
    marginBottom: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e4e9e7",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  weekRow: {
    flexDirection: "row",
  },
  weekDay: {
    flex: 1,
    color: "#748087",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  daysGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.2857%",
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  selectedDay: {
    backgroundColor: "#099669",
  },
  dayText: {
    color: "#18232a",
    fontSize: 15,
  },
  selectedDayText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  summaryRow: {
    marginBottom: 30,
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minHeight: 92,
    padding: 14,
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 16,
  },
  greenSummary: {
    borderColor: "#bfe8d8",
    backgroundColor: "#f6fffb",
  },
  redSummary: {
    borderColor: "#f1cccc",
    backgroundColor: "#fffafa",
  },
  blueSummary: {
    borderColor: "#c8ddf8",
    backgroundColor: "#fbfdff",
  },
  greenText: {
    color: "#087f5b",
  },
  redText: {
    color: "#b11c24",
  },
  blueText: {
    color: "#357bdd",
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  sectionTitle: {
    marginBottom: 14,
    color: "#111c24",
    fontSize: 23,
    fontWeight: "700",
  },
  recordsCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e4e9e7",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  recordRow: {
    minHeight: 66,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#edf0ef",
  },
  recordDate: {
    width: 47,
    color: "#27343a",
    fontSize: 12,
    fontWeight: "700",
  },
  recordValue: {
    flex: 1,
    color: "#48565c",
    fontSize: 10,
  },
  emptyRow: {
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#748087",
    fontSize: 13,
  },
  statusBadge: {
    minWidth: 53,
    paddingHorizontal: 7,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 9,
    backgroundColor: "#e9fbf3",
  },
  lateBadge: {
    backgroundColor: "#fff4e5",
  },
  statusLabel: {
    color: "#087f5b",
    fontSize: 10,
    fontWeight: "600",
  },
  lateLabel: {
    color: "#bf6a0b",
  },
});