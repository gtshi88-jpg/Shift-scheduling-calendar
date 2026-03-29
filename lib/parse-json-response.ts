/** fetch の応答本文を JSON として解釈。HTML エラーページのときは reason: html */
export function parseFetchJsonBody<T extends Record<string, unknown>>(
  text: string,
): { ok: true; data: T } | { ok: false; reason: "html" | "parse" | "empty" } {
  const trimmed = text.trimStart();
  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    const lower = trimmed.slice(0, 32).toLowerCase();
    if (lower.startsWith("<!doctype") || lower.startsWith("<html") || trimmed.startsWith("<")) {
      return { ok: false, reason: "html" };
    }
    return { ok: false, reason: "parse" };
  }
}
