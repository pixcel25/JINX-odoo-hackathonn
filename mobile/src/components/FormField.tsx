import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  
  secure?: boolean;

};

export function FormField({ label, error, secure = false, style, ...inputProps }: FormFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isSecure = secure && !isVisible;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error ? styles.inputShellError : undefined]}>
        <TextInput
          {...inputProps}
          autoCapitalize={secure ? 'none' : inputProps.autoCapitalize}
          autoCorrect={false}
          secureTextEntry={isSecure}
          style={[styles.input, style]}
          placeholderTextColor="#767878"
        />
        {secure ? (
          <Pressable
            accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
            hitSlop={10}
            onPress={() => setIsVisible((visible) => !visible)}
            style={styles.visibilityButton}
          >
            <Text style={styles.visibilityText}>{isVisible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 17,
  },
  label: {
    color: '#26332c',
    fontFamily: 'serif',
    fontSize: 15,
    marginBottom: 8,
  },
  inputShell: {
    alignItems: 'center',
    borderColor: '#d9e2dc',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 46,
  },
  inputShellError: {
    borderColor: '#d96570',
  },
  input: {
    color: '#1f2923',
    flex: 1,
    fontFamily: 'serif',
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  visibilityButton: {
    paddingHorizontal: 13,
  },
  visibilityText: {
    color: '#0b8f52',
    fontFamily: 'serif',
    fontSize: 13,
  },
  error: {
    color: '#b43c49',
    fontFamily: 'serif',
    fontSize: 13,
    marginTop: 6,
  },
});
