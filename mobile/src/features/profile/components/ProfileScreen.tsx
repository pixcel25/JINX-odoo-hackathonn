import { StyleSheet, Text, View } from "react-native";

export function ProfileScreen() {
  return (
    <View>
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Your Dayflow profile</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View>
          <Text style={styles.name}>Ashvek</Text>
          <Text style={styles.email}>ashvek@dayflow.com</Text>
        </View>
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
});