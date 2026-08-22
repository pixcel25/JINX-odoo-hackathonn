import { StyleSheet, Text, View } from "react-native";

import { AttendanceRecord } from "../models";

const attendanceRecords: AttendanceRecord[] = [
  { id: "1", date: "23 Aug", checkIn: "09:07 AM", checkOut: "05:31 PM", duration: "8h 34m", status: "present" },
  { id: "2", date: "22 Aug", checkIn: "09:10 AM", checkOut: "05:01 PM", duration: "8h 36m", status: "late" },
  { id: "3", date: "22 Aug", checkIn: "09:16 AM", checkOut: "05:05 PM", duration: "7h 47m", status: "late" },
  { id: "4", date: "21 Aug", checkIn: "09:02 AM", checkOut: "04:42 PM", duration: "8h 30m", status: "present" },
];

export function AttendanceScreen() {
  return (
    <View>
      <ScreenHeading title="Attendance" subtitle="August 2026" />
      <AttendanceCalendar />

      <View style={styles.summaryRow}>
        <SummaryCard label="Present" value="16" tone="green" />
        <SummaryCard label="Leave" value="1" tone="red" />
        <SummaryCard label="Other leave" value="2" tone="blue" />
      </View>

      <Text style={styles.sectionTitle}>Recent Records</Text>
      <View style={styles.recordsCard}>
        {attendanceRecords.map((record) => (
          <View key={record.id} style={styles.recordRow}>
            <Text style={styles.recordDate}>{record.date}</Text>
            <Text style={styles.recordValue}>{record.checkIn}</Text>
            <Text style={styles.recordValue}>{record.checkOut}</Text>
            <Text style={styles.recordValue}>{record.duration}</Text>
            <View style={[styles.statusBadge, record.status === "late" && styles.lateBadge]}>
              <Text style={[styles.statusLabel, record.status === "late" && styles.lateLabel]}>
                {record.status === "late" ? "Late" : "Present"}
              </Text>
            </View>
          </View>
        ))}
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

function AttendanceCalendar() {
  const days = createAugustDays();

  return (
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
              <View style={[styles.dayNumber, day === 23 && styles.selectedDay]}>
                <Text style={[styles.dayText, day === 23 && styles.selectedDayText]}>{day}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function createAugustDays(): Array<number | null> {
  const firstDay = new Date(Date.UTC(2026, 7, 1)).getUTCDay();
  const mondayOffset = (firstDay + 6) % 7;
  const days: Array<number | null> = Array.from({ length: mondayOffset }, () => null);

  for (let day = 1; day <= 31; day += 1) {
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