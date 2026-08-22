import { StyleSheet, Text, View } from "react-native";

export function PayrollScreen() {
  return (
    <View>
      <Text style={styles.title}>Payroll</Text>
      <Text style={styles.subtitle}>August 2026 payslip</Text>
      <View style={styles.payCard}>
        <Text style={styles.label}>Net salary</Text>
        <Text style={styles.amount}>$4,280.00</Text>
        <Text style={styles.detail}>Generated 20 Aug 2026</Text>
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
  payCard: {
    marginTop: 30,
    padding: 24,
    borderRadius: 18,
    backgroundColor: "#087451",
  },
  label: {
    color: "#d9f7eb",
    fontSize: 14,
  },
  amount: {
    marginTop: 14,
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "800",
  },
  detail: {
    marginTop: 18,
    color: "#d9f7eb",
    fontSize: 13,
  },
});