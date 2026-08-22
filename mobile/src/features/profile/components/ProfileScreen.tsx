import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { changeEmployeePassword, AuthServiceError } from "../../../auth/authService";
import type { Employee } from "../../../auth/authService";
import { FormField } from "../../../components/FormField";

type ProfileTab =
  | "Private Info"
  | "Resume"
  | "Salary Info"
  | "Security";

type ProfileField = {
  label: string;
  value: string;
};

type StoredProfile = {
  personal: ProfileField[];
  bank: ProfileField[];
  resume: ProfileField[];
  skills: string[];
  certifications: string[];
};

type ResumeList = "skills" | "certifications";

const profileTabs: ProfileTab[] = [
  "Private Info",
  "Resume",
  "Salary Info",
  "Security",
];

const PROFILE_STORAGE_KEY_PREFIX = "dayflow.employee.profile.v1.";

const salaryInformation: ProfileField[] = [
  { label: "Month Wage", value: "50,000" },
  { label: "Yearly Wage", value: "600,000" },
  { label: "Working Days in a Week", value: "22" },
  { label: "Break Time / Hours", value: "8 hours" },
  { label: "Basic Salary", value: "25,000.00 / month" },
  { label: "House Rent Allowance", value: "12,500.00 / month" },
  { label: "Standard Allowance", value: "4,167.00 / month" },
  { label: "Performance Bonus", value: "2,082.50 / month" },
  { label: "Leave Travel Allowance", value: "2,082.50 / month" },
  { label: "Fixed Allowance", value: "2,918.00 / month" },
  { label: "Employee PF Contribution", value: "3,000.00 / month" },
  { label: "Employer PF Contribution", value: "3,000.00 / month" },
  { label: "Professional Tax", value: "200.00 / month" },
];

const resumeLabels = [
  "About",
  "What I love about my job",
  "My interests and hobbies",
] as const;

function profileValue(value: string | undefined): string {
  return value?.trim() || "Not provided";
}

function formatJoinedAt(joinedAt: string | undefined): string {
  if (!joinedAt) return "Not provided";
  const date = new Date(joinedAt);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleDateString();
}

function createInitialProfile(employee: Employee): StoredProfile {
  return {
    personal: [
      { label: "Date of Birth", value: "Not provided" },
      { label: "Residing Address", value: "Not provided" },
      { label: "Nationality", value: "Not provided" },
      { label: "Personal Email", value: profileValue(employee.email) },
      { label: "Gender", value: "Not provided" },
      { label: "Marital Status", value: "Not provided" },
      { label: "Date of Joining", value: formatJoinedAt(employee.joinedAt) },
    ],
    bank: [
      { label: "Bank Details", value: "Not provided" },
      { label: "Account Number", value: "Not provided" },
      { label: "Bank Name", value: "Not provided" },
      { label: "IFSC Code", value: "Not provided" },
      { label: "PAN Number", value: "Not provided" },
      { label: "UAN Number", value: "Not provided" },
      { label: "Employee Code", value: profileValue(employee.loginId) },
    ],
    resume: resumeLabels.map((label) => ({ label, value: "Not provided" })),
    skills: [],
    certifications: [],
  };
}

export function ProfileScreen({ employee }: { employee: Employee }) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("Private Info");
  const [profileData, setProfileData] = useState<StoredProfile>(() => createInitialProfile(employee));
  const [isEditingPrivateInfo, setIsEditingPrivateInfo] = useState(false);
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const profileStorageKey = `${PROFILE_STORAGE_KEY_PREFIX}${employee.loginId}`;

  useEffect(() => {
    let isMounted = true;

    async function loadProfile(): Promise<void> {
      try {
        const storedProfile = await SecureStore.getItemAsync(profileStorageKey);
        if (storedProfile && isMounted) {
          const parsedProfile = JSON.parse(storedProfile) as Partial<StoredProfile>;
          const initialProfile = createInitialProfile(employee);
          setProfileData({
            ...initialProfile,
            ...parsedProfile,
            personal: Array.isArray(parsedProfile.personal) ? parsedProfile.personal : initialProfile.personal,
            bank: Array.isArray(parsedProfile.bank) ? parsedProfile.bank : initialProfile.bank,
            resume: Array.isArray(parsedProfile.resume)
              ? parsedProfile.resume.filter((field): field is ProfileField => Boolean(field && field.label && typeof field.value === "string"))
              : initialProfile.resume,
            skills: Array.isArray(parsedProfile.skills)
              ? parsedProfile.skills.filter((skill): skill is string => typeof skill === "string")
              : [],
            certifications: Array.isArray(parsedProfile.certifications)
              ? parsedProfile.certifications.filter((certification): certification is string => typeof certification === "string")
              : [],
          });
        }
      } catch {
        if (isMounted) setProfileError("We could not load your saved profile details.");
      }
    }

    void loadProfile();
    return () => {
      isMounted = false;
    };
  }, [profileStorageKey]);

  async function saveProfile(): Promise<void> {
    setIsSavingProfile(true);
    setProfileError("");

    try {
      await SecureStore.setItemAsync(profileStorageKey, JSON.stringify(profileData));
    } catch {
      setProfileError("We could not save your profile details. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function togglePrivateInfoEdit(): Promise<void> {
    if (isEditingPrivateInfo) await saveProfile();
    setIsEditingPrivateInfo((editing) => !editing);
  }

  async function toggleResumeEdit(): Promise<void> {
    if (isEditingResume) await saveProfile();
    setIsEditingResume((editing) => !editing);
  }

  function updatePrivateField(section: "personal" | "bank", index: number, value: string): void {
    setProfileData((current) => ({
      ...current,
      [section]: current[section].map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, value } : field,
      ),
    }));
  }

  function updateResumeField(index: number, value: string): void {
    setProfileData((current) => ({
      ...current,
      resume: current.resume.map((item, itemIndex) =>
        itemIndex === index ? { ...item, value } : item,
      ),
    }));
  }

  function updateResumeListItem(list: ResumeList, index: number, value: string): void {
    setProfileData((current) => ({
      ...current,
      [list]: current[list].map((item, itemIndex) => itemIndex === index ? value : item),
    }));
  }

  function addResumeListItem(list: ResumeList): void {
    setProfileData((current) => ({ ...current, [list]: [...current[list], ""] }));
  }

  function removeResumeListItem(list: ResumeList, index: number): void {
    setProfileData((current) => ({
      ...current,
      [list]: current[list].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  return (
    <View>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Employee details and track record</Text>
      <ProfileBanner employee={employee} />
      <ScrollView
        horizontal
        contentContainerStyle={styles.tabsContent}
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
      >
        {profileTabs.map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === tab }}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {profileError ? <Text style={styles.profileError}>{profileError}</Text> : null}
      {activeTab === "Private Info" ? (
        <PrivateInfoTab
          bankInformation={profileData.bank}
          employee={employee}
          isEditing={isEditingPrivateInfo}
          isSaving={isSavingProfile}
          onToggleEdit={togglePrivateInfoEdit}
          personalInformation={profileData.personal}
          onUpdate={updatePrivateField}
        />
      ) : null}
      {activeTab === "Resume" ? (
        <ResumeTab
          isEditing={isEditingResume}
          isSaving={isSavingProfile}
          onToggleEdit={toggleResumeEdit}
          certifications={profileData.certifications}
          onAddItem={addResumeListItem}
          onRemoveItem={removeResumeListItem}
          onUpdateItem={updateResumeListItem}
          onUpdate={updateResumeField}
          resume={profileData.resume}
          skills={profileData.skills}
        />
      ) : null}
      {activeTab === "Salary Info" ? <SalaryInfoTab /> : null}
      {activeTab === "Security" ? <SecurityTab employee={employee} /> : null}
    </View>
  );
}

function ProfileBanner({ employee }: { employee: Employee }) {
  const profileFields: ProfileField[] = [
    { label: "Login ID", value: profileValue(employee.loginId) },
    { label: "Email", value: profileValue(employee.email) },
    { label: "Mobile", value: profileValue(employee.phone) },
    { label: "Company", value: profileValue(employee.company) },
    { label: "Department", value: profileValue(employee.department) },
    { label: "Manager", value: profileValue(employee.manager) },
    { label: "Location", value: profileValue(employee.location) },
  ];

  return (
    <View style={styles.profileBanner}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>A</Text>
      </View>
      <View style={styles.identity}>
        <Text style={styles.name}>{profileValue(employee.name ?? employee.displayName)}</Text>
        <Text style={styles.role}>{profileValue(employee.title)}</Text>
      </View>
      <View style={styles.profileFields}>
        {profileFields.map((field) => (
          <InfoField key={field.label} label={field.label} value={field.value} />
        ))}
      </View>
    </View>
  );
}

function InfoField({
  editable = false,
  label,
  multiline = false,
  onChangeText,
  value,
}: ProfileField & { editable?: boolean; multiline?: boolean; onChangeText?: (value: string) => void }) {
  return (
    <View style={styles.infoField}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable ? (
        <TextInput
          accessibilityLabel={label}
          multiline={multiline}
          onChangeText={onChangeText}
          style={[styles.infoInput, multiline && styles.multilineInfoInput]}
          value={value}
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );
}

function SectionCard({
  action,
  children,
  title,
  subtitle,
}: { action?: ReactNode; children: ReactNode; title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionHeaderRight}>
          {subtitle ? <Text style={styles.sectionBadge}>{subtitle}</Text> : null}
          {action}
        </View>
      </View>
      {children}
    </View>
  );
}

function PrivateInfoTab({
  bankInformation,
  employee,
  isEditing,
  isSaving,
  onToggleEdit,
  onUpdate,
  personalInformation,
}: {
  bankInformation: ProfileField[];
  employee: Employee;
  isEditing: boolean;
  isSaving: boolean;
  onToggleEdit: () => Promise<void>;
  onUpdate: (section: "personal" | "bank", index: number, value: string) => void;
  personalInformation: ProfileField[];
}) {
  return (
    <SectionCard
      action={
        <Pressable accessibilityRole="button" disabled={isSaving} onPress={onToggleEdit} style={styles.editButton}>
          {isSaving ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.editButtonText}>{isEditing ? "Save Details" : "Edit Details"}</Text>}
        </Pressable>
      }
      title="My Profile"
      subtitle={isEditing ? "Editing" : "Editable"}
    >
      <View style={styles.profileSummary}>
        <View style={styles.smallAvatar}><Text style={styles.smallAvatarText}>A</Text></View>
        <View>
          <Text style={styles.summaryName}>{profileValue(employee.name ?? employee.displayName)}</Text>
          <Text style={styles.summaryRole}>{profileValue(employee.title)}</Text>
        </View>
      </View>
      <InfoGroup
        editable={isEditing}
        fields={personalInformation}
        onUpdate={(index, value) => onUpdate("personal", index, value)}
        title="Personal Information"
      />
      <InfoGroup
        editable={isEditing}
        fields={bankInformation}
        onUpdate={(index, value) => onUpdate("bank", index, value)}
        title="Bank Details"
      />
    </SectionCard>
  );
}

function InfoGroup({
  editable,
  fields,
  onUpdate,
  title,
}: {
  editable: boolean;
  fields: ProfileField[];
  onUpdate: (index: number, value: string) => void;
  title: string;
}) {
  return (
    <View style={styles.infoGroup}>
      <Text style={styles.subheading}>{title}</Text>
      {fields.map((field, index) => (
        <InfoField
          editable={editable}
          key={field.label}
          label={field.label}
          onChangeText={(value) => onUpdate(index, value)}
          value={field.value}
        />
      ))}
    </View>
  );
}

function ResumeTab({
  certifications,
  isEditing,
  isSaving,
  onAddItem,
  onRemoveItem,
  onToggleEdit,
  onUpdateItem,
  onUpdate,
  resume,
  skills,
}: {
  certifications: string[];
  isEditing: boolean;
  isSaving: boolean;
  onAddItem: (list: ResumeList) => void;
  onRemoveItem: (list: ResumeList, index: number) => void;
  onToggleEdit: () => Promise<void>;
  onUpdateItem: (list: ResumeList, index: number, value: string) => void;
  onUpdate: (index: number, value: string) => void;
  resume: ProfileField[];
  skills: string[];
}) {
  return (
    <SectionCard
      action={
        <Pressable accessibilityRole="button" disabled={isSaving} onPress={onToggleEdit} style={styles.editButton}>
          {isSaving ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.editButtonText}>{isEditing ? "Save Resume" : "Edit Resume"}</Text>}
        </Pressable>
      }
      title="Resume"
      subtitle={isEditing ? "Editing" : "Editable"}
    >
      <View style={styles.resumeColumns}>
        {resume.map((field, index) => (
          <InfoField
            editable={isEditing}
            key={field.label}
            label={field.label}
            multiline={field.label !== "Skills" && field.label !== "Certification"}
            onChangeText={(value) => onUpdate(index, value)}
            value={field.value}
          />
        ))}
      </View>
      <View style={styles.resumeLists}>
        <ResumeList
          editable={isEditing}
          items={skills}
          onAdd={() => onAddItem("skills")}
          onRemove={(index) => onRemoveItem("skills", index)}
          onUpdate={(index, value) => onUpdateItem("skills", index, value)}
          title="Skills"
        />
        <ResumeList
          editable={isEditing}
          items={certifications}
          onAdd={() => onAddItem("certifications")}
          onRemove={(index) => onRemoveItem("certifications", index)}
          onUpdate={(index, value) => onUpdateItem("certifications", index, value)}
          title="Certification"
        />
      </View>
    </SectionCard>
  );
}

function ResumeList({
  editable,
  items,
  onAdd,
  onRemove,
  onUpdate,
  title,
}: {
  editable: boolean;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  title: string;
}) {
  return (
    <View style={styles.resumeList}>
      <Text style={styles.subheading}>{title}</Text>
      {items.length === 0 && !editable ? <Text style={styles.emptyListText}>Not provided</Text> : null}
      {items.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.listItem}>
          {editable ? (
            <TextInput
              accessibilityLabel={`${title} ${index + 1}`}
              onChangeText={(value) => onUpdate(index, value)}
              placeholder={`Add ${title.toLowerCase()}`}
              placeholderTextColor="#809087"
              style={styles.listInput}
              value={item}
            />
          ) : (
            <Text style={styles.listValue}>{item || "Not provided"}</Text>
          )}
          {editable ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${title.toLowerCase()} ${index + 1}`} onPress={() => onRemove(index)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      {editable ? (
        <Pressable accessibilityRole="button" onPress={onAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add {title}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SalaryInfoTab() {
  return (
    <SectionCard title="Compensation & Salary Information" subtitle="Employee read only">
      <Text style={styles.readOnlyNotice}>Salary information is managed by HR and cannot be edited here.</Text>
      <View style={styles.salaryGrid}>
        {salaryInformation.map((field) => <InfoField key={field.label} label={field.label} value={field.value} />)}
      </View>
    </SectionCard>
  );
}

function SecurityTab({ employee }: { employee: Employee }) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  async function handlePasswordSave(): Promise<void> {
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Complete all password fields.");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError("Use uppercase, lowercase, a number, and a symbol in your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changeEmployeePassword(employee.loginId, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully.");
      setIsChangingPassword(false);
    } catch (error) {
      setPasswordError(error instanceof AuthServiceError ? error.message : "Your password could not be changed.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <SectionCard title="Security" subtitle="Account access">
      <Text style={styles.securityNotice}>
        Your account access is protected. Password changes and account recovery are managed through the secure sign-in flow.
      </Text>
      <View style={styles.securityRow}>
        <Text style={styles.securityLabel}>Login ID</Text>
        <Text style={styles.securityValue}>{employee.loginId}</Text>
      </View>
      <View style={styles.securityRow}>
        <Text style={styles.securityLabel}>Password</Text>
        <Text style={styles.securityValue}>Managed securely</Text>
      </View>
      {passwordSuccess ? <Text style={styles.passwordSuccess}>{passwordSuccess}</Text> : null}
      {isChangingPassword ? (
        <View style={styles.passwordForm}>
          <FormField label="Current password" onChangeText={setCurrentPassword} secure value={currentPassword} />
          <FormField label="New password" onChangeText={setNewPassword} secure value={newPassword} />
          <FormField label="Confirm new password" onChangeText={setConfirmPassword} secure value={confirmPassword} />
          {passwordError ? <Text style={styles.passwordError}>{passwordError}</Text> : null}
          <Pressable accessibilityRole="button" disabled={isSavingPassword} onPress={handlePasswordSave} style={styles.editButton}>
            {isSavingPassword ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.editButtonText}>Save Password</Text>}
          </Pressable>
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => { setPasswordError(""); setPasswordSuccess(""); setIsChangingPassword(true); }} style={styles.managePasswordButton}>
          <Text style={styles.managePasswordText}>Manage Password</Text>
        </Pressable>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  title: { color: "#111c24", fontSize: 30, fontWeight: "700" },
  subtitle: { marginTop: 6, color: "#65737a", fontSize: 16 },
  profileBanner: { marginTop: 24, padding: 18, borderWidth: 1, borderColor: "#e1e8e5", borderRadius: 18, backgroundColor: "#ffffff" },
  avatar: { width: 68, height: 68, alignItems: "center", justifyContent: "center", borderRadius: 34, backgroundColor: "#d6f8e9" },
  avatarText: { color: "#087451", fontSize: 28, fontWeight: "700" },
  identity: { marginTop: 14 },
  name: { color: "#1d2a30", fontSize: 24, fontWeight: "700" },
  role: { marginTop: 3, color: "#087451", fontSize: 14, fontWeight: "600" },
  profileFields: { marginTop: 18, flexDirection: "row", flexWrap: "wrap", columnGap: 18, rowGap: 14 },
  infoField: { flex: 1, minWidth: "43%", marginBottom: 13 },
  infoLabel: { color: "#68767b", fontSize: 12 },
  infoValue: { marginTop: 4, color: "#1d2a30", fontSize: 14, fontWeight: "600" },
  infoInput: { minHeight: 38, marginTop: 4, paddingHorizontal: 9, paddingVertical: 7, color: "#1d2a30", fontSize: 14, borderWidth: 1, borderColor: "#b9d9c5", borderRadius: 8, backgroundColor: "#fbfffc" },
  tabs: { marginTop: 22, marginHorizontal: -22 },
  tabsContent: { paddingHorizontal: 22, gap: 22 },
  tab: { paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: "#087f5b" },
  tabText: { color: "#68747b", fontSize: 13, fontWeight: "600" },
  activeTabText: { color: "#087f5b" },
  profileError: { marginTop: 14, color: "#b43c49", fontSize: 13, lineHeight: 18 },
  sectionCard: { marginTop: 18, padding: 18, borderWidth: 1, borderColor: "#e1e8e5", borderRadius: 18, backgroundColor: "#ffffff" },
  sectionHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 18 },
  sectionHeaderRight: { flexShrink: 1, alignItems: "flex-end", gap: 8 },
  sectionTitle: { flex: 1, color: "#111c24", fontSize: 19, fontWeight: "700" },
  sectionBadge: { maxWidth: 112, color: "#087451", fontSize: 11, fontWeight: "700", textAlign: "right", textTransform: "uppercase" },
  editButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7, backgroundColor: "#087f5b" },
  editButtonText: { color: "#ffffff", fontSize: 11, fontWeight: "700" },
  subheading: { marginBottom: 12, color: "#1d2a30", fontSize: 15, fontWeight: "700" },
  profileSummary: { paddingBottom: 17, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#edf0ef" },
  smallAvatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "#d6f8e9" },
  smallAvatarText: { color: "#087451", fontSize: 18, fontWeight: "700" },
  summaryName: { color: "#1d2a30", fontSize: 17, fontWeight: "700" },
  summaryRole: { marginTop: 3, color: "#68767b", fontSize: 13 },
  infoGroup: { marginTop: 22 },
  resumeItem: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: "#edf0ef" },
  resumeTitle: { color: "#1d2a30", fontSize: 15, fontWeight: "700" },
  resumePeriod: { marginTop: 5, color: "#087451", fontSize: 12, fontWeight: "600" },
  resumeCopy: { marginTop: 8, color: "#637078", fontSize: 13, lineHeight: 19 },
  resumeInput: { minHeight: 40, paddingHorizontal: 9, paddingVertical: 7, color: "#1d2a30", fontSize: 15, fontWeight: "700", borderWidth: 1, borderColor: "#b9d9c5", borderRadius: 8, backgroundColor: "#fbfffc" },
  resumePeriodInput: { minHeight: 36, marginTop: 5, paddingHorizontal: 9, paddingVertical: 6, color: "#087451", fontSize: 12, fontWeight: "600", borderWidth: 1, borderColor: "#b9d9c5", borderRadius: 8, backgroundColor: "#fbfffc" },
  resumeCopyInput: { minHeight: 76, marginTop: 8, paddingHorizontal: 9, paddingVertical: 8, color: "#637078", fontSize: 13, lineHeight: 19, borderWidth: 1, borderColor: "#b9d9c5", borderRadius: 8, backgroundColor: "#fbfffc", textAlignVertical: "top" },
  resumeColumns: { gap: 4 },
  resumeLists: { marginTop: 10, gap: 18 },
  resumeList: { paddingTop: 16, borderTopWidth: 1, borderTopColor: "#edf0ef" },
  listItem: { minHeight: 42, marginBottom: 9, flexDirection: "row", alignItems: "center", gap: 8 },
  listInput: { flex: 1, minHeight: 40, paddingHorizontal: 9, paddingVertical: 7, color: "#1d2a30", fontSize: 14, borderWidth: 1, borderColor: "#b9d9c5", borderRadius: 8, backgroundColor: "#fbfffc" },
  listValue: { flex: 1, paddingVertical: 8, color: "#1d2a30", fontSize: 14, fontWeight: "600" },
  removeButton: { paddingHorizontal: 7, paddingVertical: 7 },
  removeButtonText: { color: "#b43c49", fontSize: 11, fontWeight: "600" },
  addButton: { alignSelf: "flex-start", paddingHorizontal: 11, paddingVertical: 8, borderWidth: 1, borderColor: "#087f5b", borderRadius: 8 },
  addButtonText: { color: "#087f5b", fontSize: 12, fontWeight: "700" },
  emptyListText: { color: "#68767b", fontSize: 14, fontStyle: "italic" },
  multilineInfoInput: { minHeight: 76, textAlignVertical: "top" },
  readOnlyNotice: { marginBottom: 17, padding: 11, color: "#53645b", fontSize: 12, lineHeight: 17, borderRadius: 9, backgroundColor: "#effaf4" },
  salaryGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: 18 },
  securityNotice: { marginBottom: 16, padding: 12, color: "#53645b", fontSize: 13, lineHeight: 19, borderRadius: 9, backgroundColor: "#effaf4" },
  securityRow: { minHeight: 56, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#edf0ef" },
  securityLabel: { color: "#68767b", fontSize: 13 },
  securityValue: { color: "#1d2a30", fontSize: 14, fontWeight: "600" },
  passwordForm: { marginTop: 18 },
  passwordError: { marginBottom: 12, color: "#b43c49", fontSize: 13, lineHeight: 18 },
  passwordSuccess: { marginTop: 14, color: "#087451", fontSize: 13, lineHeight: 18 },
  managePasswordButton: { marginTop: 18, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#087f5b", borderRadius: 8 },
  managePasswordText: { color: "#087f5b", fontSize: 14, fontWeight: "700" },
});