import React from "react";

import { ProfileEditPersonalScreen, useProfileEditPersonalRouteProps } from "@/features/profile-edit-personal";

export default function ProfileEditPersonalRoute() {
  const props = useProfileEditPersonalRouteProps();
  return <ProfileEditPersonalScreen {...props} />;
}
