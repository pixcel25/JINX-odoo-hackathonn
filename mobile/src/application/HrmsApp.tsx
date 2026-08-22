import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { AttendanceScreen } from "../features/attendance/components/AttendanceScreen";
import { CheckInVerificationScreen } from "../features/attendance/components/CheckInVerificationScreen";
import {
  checkInAttendance,
  checkOutAttendance,
  todayAttendance,
} from "../features/attendance/services/attendanceService";
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

export function HrmsApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [hasRegisteredToday, setHasRegisteredToday] = useState(
    todayAttendance !== null,
  );
  const [isCheckedIn, setIsCheckedIn] = useState(Boolean(todayAttendance));
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const handleCheckIn = () => {
    setAttendanceError(null);
    setIsVerificationOpen(true);
  };

  const handleVerifiedCheckIn = async () => {
    setIsCheckingIn(true);

    try {
      await checkInAttendance(hasRegisteredToday);
      setHasRegisteredToday(true);
      setIsCheckedIn(true);
      setIsVerificationOpen(false);
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
      await checkOutAttendance(isCheckedIn);
      setIsCheckedIn(false);
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
    if (isVerificationOpen) {
      return (
        <CheckInVerificationScreen
          onVerified={handleVerifiedCheckIn}
          onCancel={() => setIsVerificationOpen(false)}
        />
      );
    }

    switch (activeTab) {
      case "attendance":
        return <AttendanceScreen />;
      case "leave":
        return <LeaveScreen />;
      case "payroll":
        return <PayrollScreen />;
      case "more":
        return <ProfileScreen />;
      case "home":
      default:
        return (
          <HomeScreen
            hasRegisteredToday={hasRegisteredToday}
            isCheckedIn={isCheckedIn}
            isCheckingIn={isCheckingIn}
            isCheckingOut={isCheckingOut}
            attendanceError={attendanceError}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onOpenLeave={() => setActiveTab("leave")}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
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
