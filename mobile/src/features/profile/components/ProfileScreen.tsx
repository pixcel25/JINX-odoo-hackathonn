import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Employee } from "../../../auth/authService";
import { EmployeeProfile, getProfile, updateProfile } from "../services/profileService";

export function ProfileScreen({ employee }: { employee: Employee }) {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getProfile(employee.token)
      .then((loadedProfile) => {
        if (isMounted) {
          setProfile(loadedProfile);
          setError("");
        }
      })
      .catch((profileError: unknown) => {
        if (isMounted) {
          setError(profileError instanceof Error ? profileError.message : "We could not load your profile.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employee.token]);

  const saveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const updatedProfile = await updateProfile(employee.token, profile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setError("");
    } catch (profileError: unknown) {
      setError(profileError instanceof Error ? profileError.message : "We could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentProfile = profile ?? {
    userId: employee.userId,
    employeeId: employee.loginId,
    email: employee.email,
    firstName: employee.displayName,
    lastName: "",
    name: employee.displayName,
    title: "Employee",
    department: "",
    company: "",
    manager: "",
    location: "",
    phone: "",
    address: "",
    avatarUrl: "",
  };

  return (
    <View>
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Your Dayflow profile</Text>
      {isLoading ? <ActivityIndicator color="#087451" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{currentProfile.name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.name}>{currentProfile.name}</Text>
          <Text style={styles.email}>{currentProfile.email}</Text>
        </View>
      </View>
      <View style={styles.detailsCard}>
        <ProfileLine label="Employee ID" value={currentProfile.employeeId} />
        <ProfileLine label="Role" value={currentProfile.title} />
        <ProfileLine label="Department" value={currentProfile.department || "Not provided"} />
        <ProfileLine label="Company" value={currentProfile.company || "Not provided"} />
        <ProfileLine label="Phone" value={currentProfile.phone || "Not provided"} editable={isEditing} onChange={(value) => setProfile({ ...currentProfile, phone: value })} />
        <ProfileLine label="Address" value={currentProfile.address || "Not provided"} editable={isEditing} onChange={(value) => setProfile({ ...currentProfile, address: value })} />
        <View style={styles.actionRow}>
          <Pressable onPress={isEditing ? saveProfile : () => setIsEditing(true)} style={styles.actionButton}>
            <Text style={styles.actionText}>{isSaving ? "Saving..." : isEditing ? "Save changes" : "Edit profile"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ProfileLine({ label, value, editable = false, onChange }: { label: string; value: string; editable?: boolean; onChange?: (value: string) => void }) {
  return (
    <View style={styles.profileLine}>
      <Text style={styles.lineLabel}>{label}</Text>
      {editable ? <TextInput value={value} onChangeText={onChange} style={styles.lineInput} /> : <Text style={styles.lineValue}>{value}</Text>}
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
  profileCard: {
    marginTop: 30,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#e1e8e5",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  avatar: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 27,
    backgroundColor: "#d6f8e9",
  },
  avatarText: {
    color: "#087451",
    fontSize: 22,
    fontWeight: "700",
  },
  name: {
    color: "#1d2a30",
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    marginTop: 4,
    color: "#68767b",
    fontSize: 13,
  },
  detailsCard: {
    marginTop: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e1e8e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  profileLine: {
    minHeight: 48,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#edf1ef",
  },
  lineLabel: {
    color: "#7a878c",
    fontSize: 12,
  },
  lineValue: {
    marginTop: 4,
    color: "#26343a",
    fontSize: 14,
    fontWeight: "600",
  },
  lineInput: {
    minHeight: 34,
    marginTop: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#d7e0dc",
    borderRadius: 8,
    color: "#26343a",
    fontSize: 14,
  },
  actionRow: {
    alignItems: "flex-end",
  },
  actionButton: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: "#087451",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});