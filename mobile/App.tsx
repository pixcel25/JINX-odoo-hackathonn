import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import type { Employee } from './src/auth/authService';
import { HrmsApp } from './src/application/HrmsApp';
import { LandingScreen, LoginScreen } from './src/screens/AuthScreens';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'app'>('landing');
  const [employee, setEmployee] = useState<Employee | null>(null);

  if (screen === 'login') {
    return (
      <>
        <LoginScreen
          onAuthenticated={(authenticatedEmployee) => {
            setEmployee(authenticatedEmployee);
            setScreen('app');
          }}
          onBack={() => setScreen('landing')}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  if (screen === 'app') {
    return employee ? <HrmsApp employee={employee} /> : null;
  }

  return (
    <>
      <LandingScreen onContinue={() => setScreen('login')} />
      <StatusBar style="dark" />
    </>
  );
}
