import React from "react";

import { ProfileEditAddressScreen, useProfileEditAddressRouteProps } from "@/features/profile-edit-address";

export default function ProfileEditAddressRoute() {
  const props = useProfileEditAddressRouteProps();
  return <ProfileEditAddressScreen {...props} />;
}
