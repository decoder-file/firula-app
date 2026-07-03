import React from "react";

import { ProfileEditScreen, useProfileEditRouteProps } from "@/features/profile-edit";

export default function ProfileEditRoute() {
  const props = useProfileEditRouteProps();
  return <ProfileEditScreen {...props} />;
}
