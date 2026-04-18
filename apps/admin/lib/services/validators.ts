export function requireNonEmpty(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} is required.`);
  }
}

export function optionalText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function requireEnumValue<T extends readonly string[]>(value: string, allowed: T, label: string): T[number] {
  if ((allowed as readonly string[]).includes(value)) {
    return value as T[number];
  }

  throw new Error(`${label} is invalid.`);
}

export function requireNonNegativeInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}
