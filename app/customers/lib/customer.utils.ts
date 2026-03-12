// ─── Customer Name Utilities ──────────────────────────────────────────────────

/**
 * Parse a full name string into first, middle, and last name parts.
 */
export const parseNameParts = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", lastName: "" };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: "", lastName: parts[1] };
  }
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleName = parts.slice(1, -1).join(" ");
  return { firstName, middleName, lastName };
};

/**
 * Format a display name, optionally in "LastName, FirstName M." format.
 */
export const formatDisplayName = (fullName: string, sortByLastName: boolean): string => {
  if (!sortByLastName) return fullName;
  const { firstName, middleName, lastName } = parseNameParts(fullName);
  if (!lastName) return fullName;
  const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : "";
  return `${lastName}, ${firstName}${middleInitial}`;
};

/**
 * Extract the last name (lowercased) from a full name string for sorting.
 */
export const getLastName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
};
