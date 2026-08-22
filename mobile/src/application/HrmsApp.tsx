import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AttendanceScreen } from "../features/attendance/components/AttendanceScreen";
import {
  checkInAttendance,
  checkOutAttendance,
  getAttendance,
} from "../features/attendance/services/attendanceService";
import {
  AttendanceRecord,
  AttendanceSummary,
} from "../features/attendance/models";
import { apiRequest, Employee } from "../auth/authService";
import { HomeScreen } from "../features/home/components/HomeScreen";
import { LeaveScreen } from "../features/leave/components/LeaveScreen";
import { PayrollScreen } from "../features/payroll/components/PayrollScreen";
import { ProfileScreen } from "../features/profile/components/ProfileScreen";

type AppTab = "home" | "attendance" | "leave" | "payroll" | "more";

const tabs: Array<{ key: AppTab; label: string; icon: string }> = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "attendance", label: "Attendance", icon: "□" },
  { key: "leave", label: "Leave", icon: "+" },
  { key: "payroll", label: "Payroll", icon: "$" },
  { key: "more", label: "More", icon: "•••" },
];

type ActivityItem = {
  id: string;
  message: string;
  createdAt: string;
};

type HrmsAppProps = {
  employee: Employee;
  onSignOut: () => Promise<void>;
};

const emptySummary: AttendanceSummary = {
  present: 0,
  absent: 0,
  late: 0,
  half_day: 0,
  on_leave: 0,
};

export function HrmsApp({ employee, onSignOut }: HrmsAppProps) {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary>(emptySummary);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData(): Promise<void> {
      setAttendanceLoading(true);
      try {
        const [attendance, notifications] = await Promise.all([
          getAttendance(employee.token),
          apiRequest<{ notifications: ActivityItem[] }>(
            "/hr/notifications/",
            employee.token,
          ),
        ]);
        if (isMounted) {
          setAttendanceRecords(attendance.records);
          setAttendanceSummary(attendance.summary);
          setRecentActivity(notifications.notifications);
          setAttendanceError(null);
        }
      } catch (error) {
        if (isMounted) {
          setAttendanceError(
            error instanceof Error
              ? error.message
              : "We could not load your HR data. Please try again.",
          );
        }
      } finally {
        if (isMounted) {
          setAttendanceLoading(false);
        }
      }
    }

    void loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [employee.token]);

  const currentDate = new Date();
  const todayKey = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0"),
  ].join("-");
  const todayAttendance =
    attendanceRecords.find((record) => record.date === todayKey) ?? null;
  const hasRegisteredToday = todayAttendance !== null;
  const isCheckedIn = Boolean(todayAttendance && !todayAttendance.checkOut);

  const refreshAttendance = async (): Promise<void> => {
    const attendance = await getAttendance(employee.token);
    setAttendanceRecords(attendance.records);
    setAttendanceSummary(attendance.summary);
  };

  const refreshActivity = async (): Promise<void> => {
    const response = await apiRequest<{ notifications: ActivityItem[] }>(
      "/hr/notifications/",
      employee.token,
    );
    setRecentActivity(response.notifications);
  };

  const handleCheckIn = async () => {
    setAttendanceError(null);
    setIsCheckingIn(true);

    try {
      await checkInAttendance(employee.token);
      await refreshAttendance();
      await refreshActivity();
    } catch (error) {
      setAttendanceError(
        error instanceof Error
          ? error.message
          : "We could not register your attendance. Please try again.",
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceError(null);
    setIsCheckingOut(true);

    try {
      await checkOutAttendance(employee.token);
      await refreshAttendance();
      await refreshActivity();
    } catch (error) {
      setAttendanceError(
        error instanceof Error
          ? error.message
          : "We could not update your attendance. Please try again.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "attendance":
        return (
          <AttendanceScreen
            records={attendanceRecords}
            summary={attendanceSummary}
            isLoading={attendanceLoading}
            error={attendanceError}
          />
        );
      case "leave":
        return <LeaveScreen employee={employee} />;
      case "payroll":
        return <PayrollScreen employee={employee} />;
      case "more":
        return <ProfileScreen employee={employee} />;
      case "home":
      default:
        return (
          <HomeScreen
            employee={employee}
            hasRegisteredToday={hasRegisteredToday}
            isCheckedIn={isCheckedIn}
            todayAttendance={todayAttendance}
            attendanceRecords={attendanceRecords}
            attendanceSummary={attendanceSummary}
            recentActivity={recentActivity}
            isCheckingIn={isCheckingIn}
            isCheckingOut={isCheckingOut}
            attendanceError={attendanceError}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onOpenLeave={() => setActiveTab("leave")}
            onSignOut={onSignOut}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderActiveScreen()}
        </ScrollView>

        <View style={styles.bottomNavigation}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <Pressable
                key={tab.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveTab(tab.key)}
                style={styles.navItem}
              >
                <Text
                  style={[styles.navIcon, isActive && styles.activeNavIcon]}
                >
                  {tab.icon}
                </Text>
                <Text
                  style={[styles.navLabel, isActive && styles.activeNavLabel]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fc",
  },
  app: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 116,
  },
  bottomNavigation: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    minHeight: 82,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e4e8e7",
  },
  navItem: {
    minWidth: 56,
    alignItems: "center",
    gap: 4,
  },
  navIcon: {
    minHeight: 22,
    color: "#68747b",
    fontSize: 22,
    lineHeight: 22,
  },
  activeNavIcon: {
    color: "#087f5b",
  },
  navLabel: {
    color: "#68747b",
    fontSize: 11,
  },
  activeNavLabel: {
    color: "#087f5b",
    fontWeight: "700",
  },
});
