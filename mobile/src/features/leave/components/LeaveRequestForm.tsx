import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  ExistingLeave,
  LeaveRequest,
  LeaveRequestFormValues,
  LeaveType,
} from "../models";
import {
  LeaveField,
  LeaveValidationErrors,
  validateLeaveRequest,
} from "../validation";
import {
  createLeaveRequest,
  LeaveRequestValidationError,
} from "../services/leaveService";
import { FeedbackBanner } from "../../../shared/components/FeedbackBanner";

type LeaveRequestFormProps = {
  email: string;
  existingLeaves: ExistingLeave[];
  onSubmitted: (request: LeaveRequest) => void;
  token: string;
};

const leaveTypes: Array<{ value: LeaveType; label: string }> = [
  { value: "annual", label: "Annual" },
  { value: "sick", label: "Sick" },
  { value: "casual", label: "Casual" },
  { value: "unpaid", label: "Unpaid" },
];

const initialValues: LeaveRequestFormValues = {
  email: "",
  leaveType: "annual",
  startDate: "",
  endDate: "",
  reason: "",
};

export function LeaveRequestForm({ email, existingLeaves, onSubmitted, token }: LeaveRequestFormProps) {
  const [values, setValues] = useState({ ...initialValues, email });
  const [errors, setErrors] = useState<LeaveValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const updateField = <Field extends LeaveField>(field: Field, value: LeaveRequestFormValues[Field]) => {
    const nextValues = { ...values, [field]: value } as LeaveRequestFormValues;
    setValues(nextValues);
    setFeedback(null);

    if (errors[field]) {
      setErrors(validateLeaveRequest(nextValues, existingLeaves));
    }
  };

  const handleBlur = () => {
    setErrors(validateLeaveRequest(values, existingLeaves));
  };

  const handleSubmit = async () => {
    const validationErrors = validateLeaveRequest(values, existingLeaves);
    setErrors(validationErrors);
    setFeedback(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const request = await createLeaveRequest(values, existingLeaves, token);
      onSubmitted(request);
      setValues({ ...initialValues, email });
      setErrors({});
      setFeedback({ kind: "success", message: "Your leave request was submitted for review." });
    } catch (error) {
      if (error instanceof LeaveRequestValidationError) {
        setErrors(error.fieldErrors);
        setFeedback({ kind: "error", message: "Please correct the highlighted fields." });
      } else {
        setFeedback({ kind: "error", message: "We could not submit your request. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      {feedback ? <FeedbackBanner kind={feedback.kind} message={feedback.message} /> : null}

      <FieldLabel label="Work email" error={errors.email} />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        onBlur={handleBlur}
        onChangeText={(value) => updateField("email", value)}
        placeholder="name@company.com"
        placeholderTextColor="#9aa5a8"
        style={[styles.input, errors.email && styles.invalidInput]}
        value={values.email}
      />

      <FieldLabel label="Leave type" error={errors.leaveType} />
      <View style={styles.typeRow}>
        {leaveTypes.map((type) => {
          const selected = values.leaveType === type.value;

          return (
            <Pressable
              key={type.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => updateField("leaveType", type.value)}
              style={[styles.typeButton, selected && styles.selectedTypeButton]}
            >
              <Text style={[styles.typeText, selected && styles.selectedTypeText]}>{type.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <FieldLabel label="Start date" error={errors.startDate} />
          <TextInput
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onBlur={handleBlur}
            onChangeText={(value) => updateField("startDate", value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9aa5a8"
            style={[styles.input, errors.startDate && styles.invalidInput]}
            value={values.startDate}
          />
        </View>
        <View style={styles.dateField}>
          <FieldLabel label="End date" error={errors.endDate} />
          <TextInput
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onBlur={handleBlur}
            onChangeText={(value) => updateField("endDate", value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9aa5a8"
            style={[styles.input, errors.endDate && styles.invalidInput]}
            value={values.endDate}
          />
        </View>
      </View>

      <FieldLabel label="Reason" error={errors.reason} />
      <TextInput
        multiline
        onBlur={handleBlur}
        onChangeText={(value) => updateField("reason", value)}
        placeholder="Tell your manager why you need leave"
        placeholderTextColor="#9aa5a8"
        style={[styles.input, styles.reasonInput, errors.reason && styles.invalidInput]}
        textAlignVertical="top"
        value={values.reason}
      />

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        onPress={handleSubmit}
        style={({ pressed }) => [styles.submitButton, pressed && styles.pressed, isSubmitting && styles.disabledButton]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>Submit request</Text>
        )}
      </Pressable>
    </View>
  );
}

function FieldLabel({ label, error }: { label: string; error?: string }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 18,
    borderWidth: 1,
    borderColor: "#e1e8e5",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  labelRow: {
    minHeight: 23,
    marginTop: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  label: {
    color: "#26343a",
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    flex: 1,
    color: "#b4232b",
    fontSize: 11,
    textAlign: "right",
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#d7e0dc",
    borderRadius: 10,
    color: "#1c292f",
    fontSize: 14,
    backgroundColor: "#fbfdfc",
  },
  invalidInput: {
    borderColor: "#d65158",
    backgroundColor: "#fff9f9",
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d7e0dc",
    borderRadius: 10,
  },
  selectedTypeButton: {
    borderColor: "#087451",
    backgroundColor: "#e6f8f0",
  },
  typeText: {
    color: "#536168",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedTypeText: {
    color: "#087451",
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateField: {
    flex: 1,
  },
  reasonInput: {
    minHeight: 92,
  },
  submitButton: {
    minHeight: 50,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#087451",
  },
  submitText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.65,
  },
});