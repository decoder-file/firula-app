const parseVersion = (value: string): number[] | null => {
  if (!/^\d+(\.\d+){0,2}$/.test(value.trim())) return null;

  const parts = value.trim().split(".").map(Number);
  while (parts.length < 3) parts.push(0);

  return parts;
};

export const isVersionBelow = (current: string, minimum: string): boolean => {
  const currentParts = parseVersion(current);
  const minimumParts = parseVersion(minimum);

  if (!currentParts || !minimumParts) return false; // fail-open on malformed input

  for (let i = 0; i < 3; i++) {
    if (currentParts[i] > minimumParts[i]) return false;
    if (currentParts[i] < minimumParts[i]) return true;
  }

  return false;
};
