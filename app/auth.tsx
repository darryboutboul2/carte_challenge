// app/auth.tsx
import { Redirect } from 'expo-router';

export default function AuthRedirect() {
  return <Redirect href="/(auth)" />;
}
