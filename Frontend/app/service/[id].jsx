import { Stack } from 'expo-router';

import ServiceDetails from '@/src/screens/ServiceDetails';

export default function ServiceDetailsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ServiceDetails />
    </>
  );
}
