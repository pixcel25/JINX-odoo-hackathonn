import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { Employee } from "../../../auth/authService";
import { getPayroll, PayrollDetails } from "../services/payrollService";

export function PayrollScreen({ employee }: { employee: Employee }) {
  const [payroll, setPayroll] = useState<PayrollDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getPayroll(employee.token)
      .then((loadedPayroll) => {
        if (isMounted) {
          setPayroll(loadedPayroll);
          setError("");
        }
      })
      .catch((payrollError: unknown) => {
        if (isMounted) {
          setError(payrollError instanceof Error ? payrollError.message : "We could not load your payroll.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employee.token]);

  return (
    <View>
      <Text style={styles.title}>Payroll</Text>
      <Text style={styles.subtitle}>{payroll?.payGrade || "Current salary structure"}</Text>
      {isLoading ? <ActivityIndicator color="#087451" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.payCard}>
        <Text style={styles.label}>Net salary</Text>
        <Text style={styles.amount}>{payroll?.netSalaryValue ? `$${Number(payroll.netSalaryValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00"}</Text>
        <Text style={styles.detail}>Monthly salary from your HR record</Text>
      </View>
      <View style={styles.breakdown}>
        <SalaryLine label="Base salary" value={payroll?.baseSalary ?? "$0.00"} />
        <SalaryLine label="Allowances" value={payroll?.allowances ?? "$0.00"} />
        <SalaryLine label="Deductions" value={payroll?.taxDeduction ?? "$0.00"} />
      </View>
    </View>
  );
}

function SalaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.salaryLine}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
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
  breakdown: {
    marginTop: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e1e8e5",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  salaryLine: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#edf1ef",
  },
  lineLabel: {
    color: "#65737a",
    fontSize: 14,
  },
  lineValue: {
    color: "#1d2a30",
    fontSize: 14,
    fontWeight: "700",
  },
});