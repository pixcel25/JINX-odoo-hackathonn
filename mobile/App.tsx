import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Employee } from './src/auth/authService';
import { HomeScreen, LandingScreen, LoginScreen } from './src/screens/AuthScreens';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'home'>('landing');
  const [employee, setEmployee] = useState<Employee | null>(null);

  if (screen === 'home' && employee) {
    return (
      <>
        <HomeScreen employee={employee} onSignOut={() => { setEmployee(null); setScreen('landing'); }} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (screen === 'login') {
    return (
      <>
        <LoginScreen onAuthenticated={(signedInEmployee) => { setEmployee(signedInEmployee); setScreen('home'); }} onBack={() => setScreen('landing')} />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <>
      <LandingScreen onContinue={() => setScreen('login')} />
      <StatusBar style="dark" />
    </>
  );
}
