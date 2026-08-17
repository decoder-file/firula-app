import React from "react";

import { ProfileEditPhotoScreen, useProfileEditPhotoRouteProps } from "@/features/profile-edit-photo";

export default function ProfileEditPhotoRoute() {
  const props = useProfileEditPhotoRouteProps();
  return <ProfileEditPhotoScreen {...props} />;
}
