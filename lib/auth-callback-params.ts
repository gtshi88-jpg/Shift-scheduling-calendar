/**
 * 認証コールバック URL からクエリ ? とフラグメント # の両方でパラメータを取得する。
 * クエリがハッシュより優先（@supabase/auth-js の parseParametersFromURL と同じ）
 */
export function parseAuthCallbackParams(href: string): Record<string, string> {
  const result: Record<string, string> = {};
  const url = new URL(href);

  if (url.hash?.startsWith("#")) {
    try {
      const hashParams = new URLSearchParams(url.hash.slice(1));
      hashParams.forEach((value, key) => {
        result[key] = value;
      });
    } catch {
      // ハッシュが query 形式でない場合は無視
    }
  }

  url.searchParams.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/** 開発時ログ用（値は出さずキーと有無だけ） */
export function summarizeAuthCallbackParams(params: Record<string, string>): {
  keys: string[];
  hasCode: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasError: boolean;
  typeHint: string | null;
} {
  const typeHint = params.type ?? null;
  return {
    keys: Object.keys(params).sort(),
    hasCode: Boolean(params.code),
    hasAccessToken: Boolean(params.access_token),
    hasRefreshToken: Boolean(params.refresh_token),
    hasError: Boolean(params.error),
    typeHint,
  };
}

/** 成功後に URL から機微なクエリ・ハッシュを取り除く */
export function stripSensitiveAuthParamsFromUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const keys = [
    "code",
    "access_token",
    "refresh_token",
    "expires_in",
    "token_type",
    "type",
    "error",
    "error_description",
    "error_code",
  ];
  for (const k of keys) {
    url.searchParams.delete(k);
  }
  url.hash = "";
  const next = url.pathname + (url.search || "");
  window.history.replaceState(window.history.state, "", next);
}
