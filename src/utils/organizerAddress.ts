import type { OrganizerProfile } from "@/services/organizer.service";

type OrganizerAddress = Pick<OrganizerProfile,
  "address" | "addressNumber" | "addressComplement" | "neighborhood" | "city" | "state" | "postalCode"
>;

export function formatOrganizerAddress(organizer: OrganizerAddress): string | null {
  const street = organizer.address?.trim();
  const city = organizer.city?.trim();
  if (!street || !city) return null;

  return [
    street,
    organizer.addressNumber?.trim(),
    organizer.addressComplement?.trim(),
    organizer.neighborhood?.trim(),
    [city, organizer.state?.trim()].filter(Boolean).join(" - "),
    organizer.postalCode?.trim(),
  ].filter(Boolean).join(", ");
}
