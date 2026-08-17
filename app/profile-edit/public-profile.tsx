import React from "react";

import { ProfileEditPublicScreen, useProfileEditPublicRouteProps } from "@/features/profile-edit-public";

export default function ProfileEditPublicRoute() {
  const props = useProfileEditPublicRouteProps();
  return <ProfileEditPublicScreen {...props} />;
}
