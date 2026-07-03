export function getDemoUser(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? 'demo@example.com';
  }

  return value?.trim() || 'demo@example.com';
}
