<<<<<<< HEAD
import { StatusBar } from "expo-status-bar";

import { HrmsApp } from "./src/application/HrmsApp";
=======
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Employee } from './src/auth/authService';
import { HomeScreen, LandingScreen, LoginScreen } from './src/screens/AuthScreens';
>>>>>>> marshal

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
<<<<<<< HEAD
      <StatusBar style="dark" />
      <HrmsApp />
=======
      <LandingScreen onContinue={() => setScreen('login')} />
      <StatusBar style="dark" />
>>>>>>> marshal
    </>
  );
}
