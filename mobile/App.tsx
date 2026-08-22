import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { HrmsApp } from './src/application/HrmsApp';
import { LandingScreen, LoginScreen } from './src/screens/AuthScreens';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'app'>('landing');

  if (screen === 'login') {
    return (
      <>
        <LoginScreen onAuthenticated={() => setScreen('app')} onBack={() => setScreen('landing')} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (screen === 'app') {
    return <HrmsApp />;
  }

  return (
    <>
      <LandingScreen onContinue={() => setScreen('login')} />
      <StatusBar style="dark" />
    </>
  );
}
