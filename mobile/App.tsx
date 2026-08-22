import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { HrmsApp } from './src/application/HrmsApp';
import { clearSession, loadSession } from './src/auth/authService';
import type { Employee } from './src/auth/authService';
import { LandingScreen, LoginScreen } from './src/screens/AuthScreens';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'app'>('login');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    loadSession()
      .then((storedEmployee) => {
        if (storedEmployee) {
          setEmployee(storedEmployee);
          setScreen('app');
        }
      })
      .finally(() => setIsRestoringSession(false));
  }, []);

  if (isRestoringSession) {
    return <StatusBar style="dark" />;
  }

  if (screen === 'login') {
    return (
      <>
        <LoginScreen
          onAuthenticated={(signedInEmployee) => {
            setEmployee(signedInEmployee);
            setScreen('app');
          }}
          onBack={() => setScreen('landing')}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  if (screen === 'app' && employee) {
    return (
      <HrmsApp
        employee={employee}
        onSignOut={async () => {
          await clearSession();
          setEmployee(null);
          setScreen('login');
        }}
      />
    );
  }

  return (
    <>
      <LandingScreen onContinue={() => setScreen('login')} />
      <StatusBar style="dark" />
    </>
  );
}
