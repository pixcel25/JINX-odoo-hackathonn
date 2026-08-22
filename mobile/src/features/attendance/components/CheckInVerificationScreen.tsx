import * as LocalAuthentication from "expo-local-authentication";
import * as Location from "expo-location";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

type CheckInVerificationScreenProps = {
  onVerified: () => Promise<void>;
  onCancel: () => void;
};

type VerificationStep = "location" | "biometric" | "complete";

const OFFICE = {
  latitude: 15.5975,
  longitude: 73.7943,
  radiusMeters: 1000,
};

function distanceInMeters(from: Location.LocationObjectCoords) {
  const earthRadius = 6_371_000;
  const latitudeDelta = ((from.latitude - OFFICE.latitude) * Math.PI) / 180;
  const longitudeDelta = ((from.longitude - OFFICE.longitude) * Math.PI) / 180;
  const latitude = (OFFICE.latitude * Math.PI) / 180;
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude) * Math.cos((from.latitude * Math.PI) / 180) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function CheckInVerificationScreen({ onVerified, onCancel }: CheckInVerificationScreenProps) {
  const [step, setStep] = useState<VerificationStep>("location");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const verifyIdentity = async () => {
    setError(null);
    setDistance(null);
    setIsRunning(true);

    try {
      if (Platform.OS === "web") {
        throw new Error("Fingerprint verification requires the iOS or Android app.");
      }

      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status !== Location.PermissionStatus.GRANTED) {
        throw new Error("Location access is required to verify that you are inside the office.");
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const officeDistance = Math.round(distanceInMeters(currentLocation.coords));
      setDistance(officeDistance);

      if (officeDistance > OFFICE.radiusMeters) {
        throw new Error(`You are ${officeDistance}m away. Move inside the office boundary to check in.`);
      }

      setStep("biometric");
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        throw new Error("Set up a fingerprint or face unlock on this device before checking in.");
      }

      const authentication = await LocalAuthentication.authenticateAsync({
        promptMessage: "Verify your identity to check in",
        cancelLabel: "Cancel",
        fallbackLabel: "Use device passcode",
        disableDeviceFallback: false,
      });

      if (!authentication.success) {
        throw new Error("Identity verification was cancelled or unsuccessful.");
      }

      setStep("complete");
      await onVerified();
    } catch (verificationError) {
      setStep("location");
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Verification failed. Please try again.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const locationPassed = distance !== null && distance <= OFFICE.radiusMeters;
  const biometricPassed = step === "complete";

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <View style={styles.brandDot} />
            <View style={[styles.brandDot, styles.brandDotSmall]} />
            <View style={[styles.brandDot, styles.brandDotBottom]} />
          </View>
          <Text style={styles.brand}>DAYFLOW HRMS</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      <Text style={styles.stepLabel}>SECURE CHECK-IN</Text>
      <Text style={styles.title}>Verify Your Identity</Text>
      <Text style={styles.subtitle}>We verify your location and device biometrics before recording attendance.</Text>

      <View style={styles.verificationCard}>
        <View style={styles.fingerprintCircle}>
          <Text style={styles.fingerprint}>⌁</Text>
        </View>

        <VerificationRow
          icon="⌖"
          label="Office location"
          detail={distance === null ? "Waiting for GPS permission" : `${distance}m from office`}
          passed={locationPassed}
          active={step === "location" && !locationPassed}
        />
        <VerificationRow
          icon="◉"
          label="Biometric identity"
          detail={biometricPassed ? "Identity confirmed" : "Fingerprint or Face ID required"}
          passed={biometricPassed}
          active={step === "biometric"}
        />

        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start secure check-in verification"
          disabled={isRunning}
          onPress={verifyIdentity}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isRunning && styles.disabled]}
        >
          {isRunning ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Verify & Check In</Text>}
        </Pressable>
        <Pressable accessibilityRole="button" disabled={isRunning} onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <Text style={styles.privacyNote}>Your biometric data stays on your device. DayFlow only receives the verification result.</Text>
    </View>
  );
}

function VerificationRow({ icon, label, detail, passed, active }: { icon: string; label: string; detail: string; passed: boolean; active: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, passed && styles.rowIconPassed, active && styles.rowIconActive]}>
        <Text style={[styles.rowIconText, passed && styles.rowIconTextPassed]}>{passed ? "✓" : icon}</Text>
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Text style={[styles.rowStatus, passed && styles.rowStatusPassed]}>{passed ? "Verified" : active ? "Checking" : "Pending"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingBottom: 20 },
  header: { marginBottom: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandMark: { position: "relative", width: 34, height: 30 },
  brandDot: { position: "absolute", top: 0, left: 15, width: 18, height: 18, borderWidth: 3, borderColor: "#08704f", borderRadius: 9 },
  brandDotSmall: { top: 17, left: 0, width: 12, height: 12, borderRadius: 6 },
  brandDotBottom: { top: 18, left: 16, width: 10, height: 10, borderRadius: 5 },
  brand: { color: "#075f45", fontSize: 21, fontWeight: "800" },
  avatar: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#d9f4e9", borderRadius: 21 },
  avatarText: { color: "#08704f", fontSize: 18, fontWeight: "700" },
  stepLabel: { color: "#08704f", fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  title: { marginTop: 10, color: "#111b25", fontSize: 32, fontWeight: "800" },
  subtitle: { marginTop: 8, color: "#637078", fontSize: 15, lineHeight: 22 },
  verificationCard: { marginTop: 28, padding: 24, borderRadius: 22, backgroundColor: "#ffffff", shadowColor: "#10231c", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  fingerprintCircle: { width: 126, height: 126, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 24, borderRadius: 63, backgroundColor: "#edf8f3" },
  fingerprint: { color: "#087451", fontSize: 82, lineHeight: 92, transform: [{ rotate: "90deg" }] },
  row: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: "#edf0ef" },
  rowIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#bdc9c4", borderRadius: 17 },
  rowIconActive: { borderColor: "#087451" },
  rowIconPassed: { borderColor: "#087451", backgroundColor: "#e1f7ed" },
  rowIconText: { color: "#68747b", fontSize: 18, fontWeight: "700" },
  rowIconTextPassed: { color: "#087451" },
  rowCopy: { flex: 1 },
  rowLabel: { color: "#1a2925", fontSize: 16, fontWeight: "700" },
  rowDetail: { marginTop: 3, color: "#77837f", fontSize: 12 },
  rowStatus: { color: "#77837f", fontSize: 12, fontWeight: "700" },
  rowStatusPassed: { color: "#087451" },
  error: { marginTop: 16, padding: 12, borderRadius: 10, color: "#a33a2f", backgroundColor: "#fff1ef", fontSize: 13, lineHeight: 19 },
  primaryButton: { minHeight: 56, marginTop: 22, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#087451" },
  primaryButtonText: { color: "#ffffff", fontSize: 17, fontWeight: "800" },
  cancelButton: { alignItems: "center", paddingVertical: 15 },
  cancelText: { color: "#637078", fontSize: 15, fontWeight: "600" },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.65 },
  privacyNote: { marginTop: 22, paddingHorizontal: 14, color: "#77837f", textAlign: "center", fontSize: 12, lineHeight: 18 },
});
