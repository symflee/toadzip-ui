export function isSafeShowcaseLocalLink(value: string) {
  const normalized = value.trim();
  if (!normalized || /[\\\u0000-\u001f\u007f]/.test(normalized)) return false;
  return normalized.startsWith("#")
    || normalized.startsWith("/") && !normalized.startsWith("//")
    || normalized.startsWith("./")
    || normalized.startsWith("../")
    || normalized.startsWith("?");
}
