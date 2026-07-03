import React from 'react';
import { Stack } from 'expo-router';

import { EventDetailScreen, useEventDetailRouteProps } from '@/features/event-detail';

export default function EventDetailRoute() {
  const props = useEventDetailRouteProps();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EventDetailScreen {...props} />
    </>
  );
}
