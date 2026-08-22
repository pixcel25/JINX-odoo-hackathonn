import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FeedbackBanner } from "../../../shared/components/FeedbackBanner";
import { Employee } from "../../../auth/authService";
import { AttendanceRecord, AttendanceSummary } from "../../attendance/models";

type HomeScreenProps = {
  employee: Employee;
  hasRegisteredToday: boolean;
  isCheckedIn: boolean;
  todayAttendance: AttendanceRecord | null;
  attendanceRecords: AttendanceRecord[];
  attendanceSummary: AttendanceSummary;
  recentActivity: Array<{ id: string; message: string; createdAt: string }>;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  attendanceError: string | null;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  onOpenLeave: () => void;
  onSignOut: () => Promise<void>;
};

export function HomeScreen({
  employee,
  hasRegisteredToday,
  isCheckedIn,
  todayAttendance,
  attendanceRecords,
  attendanceSummary,
  recentActivity,
  isCheckingIn,
  isCheckingOut,
  attendanceError,
  onCheckIn,
  onCheckOut,
  onOpenLeave,
  onSignOut,
}: HomeScreenProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const attendanceDays =
    attendanceSummary.present +
    attendanceSummary.late +
    attendanceSummary.half_day;
  const attendanceRate = attendanceRecords.length
    ? Math.round((attendanceDays / attendanceRecords.length) * 100)
    : 0;

  useEffect(() => {
    setCurrentTime(Date.now());
    if (!isCheckedIn || !todayAttendance?.checkInAt) return;

    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isCheckedIn, todayAttendance?.checkInAt]);

  const checkInTime = todayAttendance
    ? formatClock(todayAttendance.checkInAt, todayAttendance.checkIn)
    : "";
  const checkOutTime = todayAttendance?.checkOutAt
    ? formatClock(todayAttendance.checkOutAt, todayAttendance.checkOut)
    : todayAttendance?.checkOut;
  const workedDuration = todayAttendance
    ? formatWorkedDuration(todayAttendance, currentTime)
    : "No record for this day";

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <View style={styles.brandDot} />
            <View style={[styles.brandDot, styles.brandDotSmall]} />
            <View style={[styles.brandDot, styles.brandDotBottom]} />
          </View>
          <Text style={styles.brand}>DAYFLOW HRMS</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={() => void onSignOut()}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {employee.displayName.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.greeting}>Good morning, {employee.displayName}</Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Text>

      <View
        style={[
          styles.attendanceCard,
          !hasRegisteredToday && styles.unregisteredCard,
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusIcon}>
              {hasRegisteredToday && isCheckedIn ? "✓" : "-"}
            </Text>
            <Text style={styles.statusText}>
              {hasRegisteredToday
                ? isCheckedIn
                  ? "Checked In"
                  : "Checked Out"
                : "Not Registered"}
            </Text>
          </View>
          <Text style={styles.workingText}>
            {hasRegisteredToday
              ? isCheckedIn
                ? "Working"
                : "Completed"
              : "No attendance"}
          </Text>
        </View>
        <Text style={styles.checkInTime}>{checkInTime || "No check-in"}</Text>
        <Text style={styles.elapsedTime}>{workedDuration}</Text>
        {checkOutTime ? (
          <Text style={styles.checkOutTime}>Checked out at {checkOutTime}</Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={
            isCheckingIn ||
            isCheckingOut ||
            (hasRegisteredToday && !isCheckedIn)
          }
          onPress={hasRegisteredToday ? onCheckOut : onCheckIn}
          style={({ pressed }) => [
            styles.checkOutButton,
            pressed && styles.pressed,
            (isCheckingIn ||
              isCheckingOut ||
              (hasRegisteredToday && !isCheckedIn)) &&
              styles.disabledButton,
          ]}
        >
          {isCheckingIn || isCheckingOut ? (
            <ActivityIndicator color="#08684d" />
          ) : (
            <Text style={styles.checkOutText}>
              {hasRegisteredToday
                ? isCheckedIn
                  ? "Check Out  >"
                  : "Day complete"
                : "Check In  >"}
            </Text>
          )}
        </Pressable>
      </View>

      {attendanceError ? (
        <FeedbackBanner kind="error" message={attendanceError} />
      ) : null}

      <View style={styles.metricsRow}>
        <Metric
          label="Attendance"
          value={String(attendanceDays)}
          suffix="days"
        />
        <Metric
          label="Leave Balance"
          value={String(employee.paidLeaveAvailable ?? 0)}
          suffix="days"
        />
        <Metric label="Attendance Rate" value={`${attendanceRate}%`} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Pressable accessibilityRole="button" onPress={onOpenLeave}>
          <Text style={styles.link}>Request leave</Text>
        </Pressable>
      </View>

      <View style={styles.activityCard}>
        {recentActivity.length ? (
          recentActivity.slice(0, 3).map((item, index) => {
            const createdAt = new Date(item.createdAt);
            return (
              <View
                key={item.id}
                style={[styles.activityRow, index > 0 && styles.activityBorder]}
              >
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>i</Text>
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{item.message}</Text>
                  <Text style={styles.activityDetail}>HRMS activity</Text>
                </View>
                <View style={styles.activityTime}>
                  <Text style={styles.activityDate}>
                    {createdAt.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                  <Text style={styles.activityClock}>
                    {createdAt.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyActivityRow}>
            <Text style={styles.activityDetail}>No recent activity.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function formatClock(timestamp: string | undefined, fallback: string): string {
  if (!timestamp) return fallback || "";
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? fallback || ""
    : date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
}

function formatWorkedDuration(
  record: AttendanceRecord,
  currentTime: number,
): string {
  if (!record.checkInAt) return record.duration;
  const checkIn = new Date(record.checkInAt).getTime();
  const checkOut = record.checkOutAt
    ? new Date(record.checkOutAt).getTime()
    : currentTime;
  if (Number.isNaN(checkIn) || Number.isNaN(checkOut)) return record.duration;

  const totalMinutes = Math.max(0, Math.floor((checkOut - checkIn) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {suffix ? <Text style={styles.metricSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    position: "relative",
    width: 34,
    height: 30,
  },
  brandDot: {
    position: "absolute",
    top: 0,
    left: 15,
    width: 18,
    height: 18,
    borderWidth: 3,
    borderColor: "#08704f",
    borderRadius: 9,
  },
  brandDotSmall: {
    top: 17,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  brandDotBottom: {
    top: 18,
    left: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brand: {
    color: "#075f45",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d9f4e9",
    borderRadius: 21,
  },
  avatarText: {
    color: "#08704f",
    fontSize: 18,
    fontWeight: "700",
  },
  signOutText: {
    color: "#087451",
    fontSize: 12,
    fontWeight: "700",
  },
  greeting: {
    color: "#111b25",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0,
  },
  date: {
    marginTop: 6,
    color: "#637078",
    fontSize: 17,
  },
  attendanceCard: {
    minHeight: 350,
    marginTop: 44,
    marginBottom: 24,
    padding: 28,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#087451",
  },
  unregisteredCard: {
    backgroundColor: "#d97706",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 20,
    backgroundColor: "#338d70",
  },
  statusIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  statusText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  workingText: {
    color: "#e8f7f1",
    fontSize: 16,
    fontWeight: "600",
  },
  checkInTime: {
    marginTop: 42,
    color: "#ffffff",
    fontSize: 50,
    fontWeight: "800",
    letterSpacing: 0,
  },
  elapsedTime: {
    marginTop: 4,
    color: "#e3f5ef",
    fontSize: 23,
    fontWeight: "600",
  },
  checkOutTime: {
    marginTop: 8,
    color: "#d6eee6",
    fontSize: 14,
  },
  checkOutButton: {
    minHeight: 60,
    marginTop: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },
  checkOutText: {
    color: "#066647",
    fontSize: 17,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  metricsRow: {
    marginBottom: 48,
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minHeight: 122,
    padding: 14,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e9e8",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  metricLabel: {
    maxWidth: 90,
    color: "#45535a",
    fontSize: 13,
    lineHeight: 18,
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  metricValue: {
    color: "#06704e",
    fontSize: 29,
    fontWeight: "700",
  },
  metricSuffix: {
    color: "#4d5b60",
    fontSize: 13,
  },
  sectionHeader: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#101a23",
    fontSize: 24,
    fontWeight: "700",
  },
  link: {
    color: "#08704f",
    fontSize: 14,
    fontWeight: "600",
  },
  activityCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e9e8",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  activityRow: {
    minHeight: 102,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emptyActivityRow: {
    minHeight: 80,
    padding: 18,
    justifyContent: "center",
  },
  activityBorder: {
    borderTopWidth: 1,
    borderTopColor: "#edf0ef",
  },
  activityIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#d6f8e9",
  },
  activityIconText: {
    color: "#08704f",
    fontSize: 22,
    fontWeight: "700",
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    color: "#172128",
    fontSize: 16,
    fontWeight: "500",
  },
  activityDetail: {
    marginTop: 4,
    color: "#67747a",
    fontSize: 13,
  },
  activityTime: {
    alignItems: "flex-end",
  },
  activityDate: {
    color: "#344249",
    fontSize: 14,
    fontWeight: "600",
  },
  activityClock: {
    marginTop: 4,
    color: "#7b8589",
    fontSize: 12,
  },
});
