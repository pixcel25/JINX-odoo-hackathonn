import { StyleSheet, Text, View } from "react-native";

type FeedbackBannerProps = {
  kind: "success" | "error";
  message: string;
};

export function FeedbackBanner({ kind, message }: FeedbackBannerProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, kind === "error" ? styles.error : styles.success]}
    >
      <Text style={styles.title}>{kind === "error" ? "Something went wrong" : "Done"}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: 18,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  success: {
    backgroundColor: "#e9fbf3",
    borderColor: "#b7ecd7",
  },
  error: {
    backgroundColor: "#fff1f0",
    borderColor: "#f5c3c0",
  },
  title: {
    marginBottom: 3,
    color: "#172026",
    fontSize: 14,
    fontWeight: "700",
  },
  message: {
    color: "#506067",
    fontSize: 13,
    lineHeight: 19,
  },
});