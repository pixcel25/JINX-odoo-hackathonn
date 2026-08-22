import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { AuthServiceError, changePassword, login } from '../auth/authService';
import type { Employee } from '../auth/authService';
import { FormField } from '../components/FormField';

type LandingScreenProps = {
  onContinue: () => void;
};

type LoginScreenProps = {
  onAuthenticated: (employee: Employee) => void;
  onBack: () => void;
};

type LoginValidationErrors = {
  loginId: string;
  password: string;
};

type NewPasswordValidationErrors = {
  password: string;
  confirmation: string;
};

type PressableStyleState = {
  pressed: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/**
 * Validates the login identifier and password before an authentication request.
 * @param loginId - The employee email entered in the login form.
 * @param password - The password entered in the login form.
 * @returns Field-level validation messages, using an empty string for valid fields.
 */
function validateLogin(loginId: string, password: string): LoginValidationErrors {
  return {
    loginId: emailPattern.test(loginId.trim()) ? '' : 'Enter the email provided by your admin.',
    password: password.length >= 8 ? '' : 'Password must be at least 8 characters.',
  };
}

/**
 * Validates the password selected during the mandatory first-login password change.
 * @param password - The new password entered by the employee.
 * @param confirmation - The repeated new password entered by the employee.
 * @returns Field-level validation messages, using an empty string for valid fields.
 */
function validateNewPassword(
  password: string,
  confirmation: string,
): NewPasswordValidationErrors {
  const errors: NewPasswordValidationErrors = {
    password: '',
    confirmation: '',
  };

  if (password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  } else if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    errors.password = 'Use uppercase, lowercase, a number, and a symbol.';
  }

  if (confirmation !== password) {
    errors.confirmation = 'Passwords do not match.';
  }

  return errors;
}

/**
 * Converts an unknown request failure into a user-safe message for the UI.
 * @param error - The value thrown by the authentication service.
 * @param fallback - The message shown when the thrown value is not an AuthServiceError.
 * @returns A message that can be rendered to the employee.
 */
function getRequestErrorMessage(error: unknown, fallback: string): string {
  return error instanceof AuthServiceError ? error.message : fallback;
}

/**
 * Builds the visual styles for a pressable primary action.
 * @param pressed - Whether the employee is currently pressing the action.
 * @returns The base and pressed-state styles for the action button.
 */
function getPrimaryButtonStyle({ pressed }: PressableStyleState): StyleProp<ViewStyle> {
  return [styles.primaryButton, pressed ? styles.buttonPressed : undefined];
}

/**
 * Renders the employee portal landing screen.
 * @param onContinue - Callback invoked when the employee opens the login screen.
 * @returns The landing screen React element.
 */
export function LandingScreen({ onContinue }: LandingScreenProps) {
  return (
    <View style={styles.page}>
      <View style={styles.landingDecoration} />
      <View style={styles.landingContent}>
        <View style={styles.brandMark}>
          <View style={styles.brandLeaf} />
          <View style={styles.brandStem} />
        </View>
        <Text style={styles.brandName}>dayflow</Text>
        <Text style={styles.tagline}>A calmer workday starts here.</Text>
        <Text style={styles.landingCopy}>
          Your work life, thoughtfully gathered in one place.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to employee login"
          onPress={onContinue}
          style={getPrimaryButtonStyle}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>
      <Text style={styles.footerText}>EMPLOYEE PORTAL</Text>
    </View>
  );
}

/**
 * Renders the employee login screen and coordinates authentication state.
 * @param onAuthenticated - Callback invoked after a successful login or password change.
 * @param onBack - Callback invoked when the employee returns to the landing screen.
 * @returns The login screen React element.
 */
export function LoginScreen({ onAuthenticated, onBack }: LoginScreenProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginValidationErrors>({ loginId: '', password: '' });
  const [requestError, setRequestError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmployee, setPendingEmployee] = useState<Employee | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  /**
   * Validates the form and submits the employee credentials to the auth service.
   * @returns A promise that resolves after the login request and state updates finish.
   */
  async function handleLogin(): Promise<void> {
    const validationErrors = validateLogin(loginId, password);
    setErrors(validationErrors);
    setRequestError('');

    if (validationErrors.loginId || validationErrors.password) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(loginId, password);
      if (result.status === 'password-change-required') {
        setPendingEmployee(result.employee);
      } else {
        onAuthenticated(result.employee);
      }
    } catch (error) {
      setRequestError(getRequestErrorMessage(error, 'We could not sign you in. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Saves the employee's new password after the first-login prompt is completed.
   * @param nextPassword - The validated password selected by the employee.
   * @returns A promise that resolves after the password change request finishes.
   */
  async function handlePasswordChange(nextPassword: string): Promise<void> {
    if (!pendingEmployee) {
      return;
    }

    setIsChangingPassword(true);
    try {
      const employee = await changePassword(pendingEmployee.loginId, nextPassword);
      setPendingEmployee(null);
      onAuthenticated(employee);
    } catch (error) {
      setRequestError(getRequestErrorMessage(error, 'We could not save your new password. Please try again.'));
    } finally {
      setIsChangingPassword(false);
    }
  }

  /**
   * Updates the login ID and clears its validation message as the employee types.
   * @param value - The latest login ID field value.
   * @returns Nothing; updates local login form state.
   */
  function handleLoginIdChange(value: string): void {
    setLoginId(value);
    if (errors.loginId) setErrors({ ...errors, loginId: '' });
  }

  /**
   * Updates the login password and clears its validation message as the employee types.
   * @param value - The latest password field value.
   * @returns Nothing; updates local login form state.
   */
  function handleLoginPasswordChange(value: string): void {
    setPassword(value);
    if (errors.password) setErrors({ ...errors, password: '' });
  }

  /**
   * Builds the login button style with its loading-state appearance.
   * @param pressed - The current press state supplied by React Native.
   * @returns The base, pressed, and optional disabled styles for the login button.
   */
  function getLoginButtonStyle({ pressed }: PressableStyleState): StyleProp<ViewStyle> {
    return [
      styles.primaryButton,
      pressed ? styles.buttonPressed : undefined,
      isLoading ? styles.buttonDisabled : undefined,
    ];
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.page}
    >
      <ScrollView
        contentContainerStyle={styles.loginScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Back to landing page" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>{'<  Back'}</Text>
        </Pressable>
        <View style={styles.loginPanel}>
          <Text style={styles.eyebrow}>EMPLOYEE ACCESS</Text>
          <Text style={styles.loginTitle}>Welcome back.</Text>
          <Text style={styles.loginSubtitle}>Sign in with the details provided by your admin.</Text>

          <View style={styles.form}>
            <FormField
              autoComplete="email"
              autoFocus
              keyboardType="email-address"
              label="Login ID / Email"
              onChangeText={handleLoginIdChange}
              error={errors.loginId}
              value={loginId}
            />
            <FormField
              autoComplete="password"
              label="Password"
              onChangeText={handleLoginPasswordChange}
              error={errors.password}
              returnKeyType="done"
              secure
              value={password}
              onSubmitEditing={handleLogin}
            />

            {requestError ? (
              <View accessibilityLiveRegion="polite" style={styles.requestErrorBox}>
                <Text style={styles.requestError}>{requestError}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              disabled={isLoading}
              onPress={handleLogin}
              style={getLoginButtonStyle}
            >
              {isLoading ? <ActivityIndicator color="#111313" /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
            </Pressable>
          </View>
        </View>
        <Text style={styles.loginFooter}>Need access? Contact your administrator.</Text>
      </ScrollView>
      <PasswordChangeModal
        error={requestError}
        isLoading={isChangingPassword}
        visible={Boolean(pendingEmployee)}
        onSubmit={handlePasswordChange}
      />
    </KeyboardAvoidingView>
  );
}

type PasswordChangeModalProps = {
  error: string;
  isLoading: boolean;
  onSubmit: (password: string) => void;
  visible: boolean;
};

/**
 * Renders the non-dismissible first-login password change dialog.
 * @param error - A request error to display below the password fields.
 * @param isLoading - Whether the password change request is in progress.
 * @param onSubmit - Callback invoked with the validated new password.
 * @param visible - Whether the dialog is currently shown.
 * @returns The password change modal React element.
 */
function PasswordChangeModal({ error, isLoading, onSubmit, visible }: PasswordChangeModalProps) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<NewPasswordValidationErrors>({ password: '', confirmation: '' });

  /**
   * Validates both new-password fields and submits them when valid.
   * @returns Nothing; updates validation state or invokes the submit callback.
   */
  function handleSubmit(): void {
    const validationErrors = validateNewPassword(password, confirmation);
    setErrors(validationErrors);
    if (!validationErrors.password && !validationErrors.confirmation) {
      onSubmit(password);
    }
  }

  /**
   * Updates the new password and clears its validation message as the employee types.
   * @param value - The latest new password field value.
   * @returns Nothing; updates local password form state.
   */
  function handleNewPasswordChange(value: string): void {
    setPassword(value);
    if (errors.password) setErrors({ ...errors, password: '' });
  }

  /**
   * Updates the confirmation password and clears its validation message as the employee types.
   * @param value - The latest confirmation field value.
   * @returns Nothing; updates local password form state.
   */
  function handleConfirmationChange(value: string): void {
    setConfirmation(value);
    if (errors.confirmation) setErrors({ ...errors, confirmation: '' });
  }

  /**
   * Prevents dismissal of the first-login dialog before a new password is saved.
   * @returns Nothing; intentionally keeps the mandatory dialog open.
   */
  function preventModalDismiss(): void {
    return;
  }

  return (
    <Modal animationType="fade" onRequestClose={preventModalDismiss} transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalEyebrow}>FIRST SIGN IN</Text>
          <Text style={styles.modalTitle}>Make it yours.</Text>
          <Text style={styles.modalCopy}>Your admin gave you a temporary password. Create a new one to continue.</Text>
          <FormField
            label="New password"
            onChangeText={handleNewPasswordChange}
            error={errors.password}
            secure
            value={password}
          />
          <FormField
            label="Confirm new password"
            onChangeText={handleConfirmationChange}
            error={errors.confirmation}
            secure
            value={confirmation}
          />
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save new password"
            disabled={isLoading}
            onPress={handleSubmit}
            style={[styles.primaryButton, isLoading ? styles.buttonDisabled : undefined]}
          >
            {isLoading ? <ActivityIndicator color="#111313" /> : <Text style={styles.primaryButtonText}>Save password</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Renders the minimal authenticated employee landing state.
 * @param employee - The authenticated employee shown in the greeting.
 * @param onSignOut - Callback invoked when the employee ends the session.
 * @returns The authenticated home screen React element.
 */
export function HomeScreen({ employee, onSignOut }: { employee: Employee; onSignOut: () => void }) {
  return (
    <View style={[styles.page, styles.homePage]}>
      <Text style={styles.eyebrow}>DAYFLOW / EMPLOYEE</Text>
      <Text style={styles.homeTitle}>Good to see you,</Text>
      <Text style={styles.homeName}>{employee.displayName}.</Text>
      <Text style={styles.homeCopy}>Your account is ready. More of your workday will live here soon.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={onSignOut} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  landingDecoration: {
    borderColor: '#dceee2',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    height: 240,
    left: 25,
    opacity: 0.75,
    position: 'absolute',
    top: 42,
    transform: [{ rotate: '-12deg' }],
    width: 145,
  },
  landingContent: {
    alignItems: 'center',
    backgroundColor: '#f8fcf9',
    borderColor: '#dceee2',
    borderWidth: 1,
    borderRadius: 13,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 52,
    marginHorizontal: 20,
    marginTop: 70,
    paddingHorizontal: 30,
  },
  brandMark: {
    height: 43,
    marginBottom: 9,
    width: 48,
  },
  brandLeaf: {
    backgroundColor: '#43bd70',
    borderBottomLeftRadius: 22,
    borderTopRightRadius: 22,
    height: 28,
    left: 13,
    position: 'absolute',
    top: 0,
    transform: [{ rotate: '-18deg' }],
    width: 24,
  },
  brandStem: {
    backgroundColor: '#43bd70',
    height: 29,
    left: 25,
    position: 'absolute',
    top: 20,
    transform: [{ rotate: '17deg' }],
    width: 2,
  },
  brandName: {
    color: '#128a4f',
    fontFamily: 'serif',
    fontSize: 48,
    letterSpacing: 0,
    textAlign: 'center',
  },
  tagline: {
    color: '#2c4034',
    fontFamily: 'serif',
    fontSize: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  landingCopy: {
    color: '#647069',
    fontFamily: 'serif',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 23,
    maxWidth: 265,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0b9253',
    borderRadius: 7,
    justifyContent: 'center',
    marginTop: 31,
    minHeight: 48,
    paddingHorizontal: 20,
    width: '100%',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  footerText: {
    bottom: 28,
    color: '#87918a',
    fontFamily: 'serif',
    fontSize: 11,
    left: 40,
    letterSpacing: 2,
    position: 'absolute',
  },
  loginScroll: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
  },
  backText: {
    color: '#45b86d',
    fontFamily: 'serif',
    fontSize: 15,
  },
  loginPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e3ebe6',
    borderRadius: 13,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 33,
    paddingHorizontal: 23,
    paddingVertical: 27,
  },
  eyebrow: {
    color: '#168a51',
    fontFamily: 'serif',
    fontSize: 11,
    letterSpacing: 2,
  },
  loginTitle: {
    color: '#15231b',
    fontFamily: 'serif',
    fontSize: 36,
    marginTop: 10,
  },
  loginSubtitle: {
    color: '#6c766f',
    fontFamily: 'serif',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 9,
  },
  form: {
    marginTop: 30,
  },
  requestErrorBox: {
    backgroundColor: '#fff1f2',
    borderColor: '#e7a8ae',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  requestError: {
    color: '#a53e4a',
    fontFamily: 'serif',
    fontSize: 13,
    lineHeight: 19,
  },
  loginFooter: {
    color: '#87918a',
    fontFamily: 'serif',
    fontSize: 13,
    marginTop: 25,
    textAlign: 'center',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 8, 8, 0.84)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe6df',
    borderRadius: 13,
    borderWidth: 1,
    padding: 24,
    width: '100%',
  },
  modalEyebrow: {
    color: '#168a51',
    fontFamily: 'serif',
    fontSize: 11,
    letterSpacing: 2,
  },
  modalTitle: {
    color: '#15231b',
    fontFamily: 'serif',
    fontSize: 29,
    marginTop: 9,
  },
  modalCopy: {
    color: '#6c766f',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
    marginTop: 8,
  },
  modalError: {
    color: '#a53e4a',
    fontFamily: 'serif',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  homePage: {
    justifyContent: 'center',
    paddingHorizontal: 31,
  },
  homeTitle: {
    color: '#15231b',
    fontFamily: 'serif',
    fontSize: 38,
    marginTop: 22,
  },
  homeName: {
    color: '#55c27a',
    fontFamily: 'serif',
    fontSize: 38,
  },
  homeCopy: {
    color: '#6c766f',
    fontFamily: 'serif',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
    maxWidth: 290,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#43bd70',
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 32,
    minHeight: 47,
  },
  secondaryButtonText: {
    color: '#168a51',
    fontFamily: 'serif',
    fontSize: 15,
  },
});
