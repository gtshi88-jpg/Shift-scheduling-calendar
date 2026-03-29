"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  parseAuthCallbackParams,
  stripSensitiveAuthParamsFromUrl,
  summarizeAuthCallbackParams,
} from "@/lib/auth-callback-params";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const AUTH_CALLBACK_LOG = "[auth/callback]";

function authCallbackDebug(message: string, data?: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  if (data !== undefined) {
    console.info(AUTH_CALLBACK_LOG, message, data);
  } else {
    console.info(AUTH_CALLBACK_LOG, message);
  }
}

// 警告ログを出力する関数
function authCallbackWarn(message: string, data?: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  if (data !== undefined) {
    console.warn(AUTH_CALLBACK_LOG, message, data);
  } else {
    console.warn(AUTH_CALLBACK_LOG, message);
  }
}

// 認証コールバックのコンテンツを表示する関数
function AuthCallbackContent() {
  const router = useRouter();
  const [message, setMessage] = useState("認証を処理しています…");
  const [showHomeButton, setShowHomeButton] = useState(false);

  useEffect(() => {
    const href = window.location.href;
    const params = parseAuthCallbackParams(href);
    const mergedError = params.error;
    const mergedErrorDesc = params.error_description;

    if (mergedError) {
      queueMicrotask(() => {
        setMessage(mergedErrorDesc ?? mergedError);
        setShowHomeButton(true);
      });
      return;
    }

    const supabase = createSupabaseBrowserClient();

    void (async () => {
      authCallbackDebug("URL パラメータ概要", summarizeAuthCallbackParams(params));

      const initResult = await supabase.auth.initialize();
      if (initResult.error) {
        authCallbackWarn("initialize() がエラーを返しました（ハッシュの implicit と PKCE 併用時などに起き得ます）", {
          message: initResult.error.message,
          name: initResult.error.name,
        });
      }

      const {
        data: { session: sessionAfterInit },
      } = await supabase.auth.getSession();
      if (sessionAfterInit) {
        authCallbackDebug("initialize/getSession ですでにセッションあり → トップへ");
        stripSensitiveAuthParamsFromUrl();
        router.replace("/");
        router.refresh();
        return;
      }

      const code = params.code;
      if (code) {
        authCallbackDebug("PKCE: exchangeCodeForSession を試行（クエリまたは # から取得）");
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          authCallbackWarn("exchangeCodeForSession 失敗", error.message);
          setMessage(error.message);
          setShowHomeButton(true);
          return;
        }
        stripSensitiveAuthParamsFromUrl();
        router.replace("/");
        router.refresh();
        return;
      }

      const access_token = params.access_token;
      const refresh_token = params.refresh_token;
      if (access_token && refresh_token) {
        authCallbackDebug("implicit: setSession を試行（# の access_token / refresh_token）");
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          authCallbackWarn("setSession 失敗", error.message);
          setMessage(error.message);
          setShowHomeButton(true);
          return;
        }
        stripSensitiveAuthParamsFromUrl();
        router.replace("/");
        router.refresh();
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        authCallbackWarn("getSession エラー", sessionError.message);
        setMessage(sessionError.message);
        setShowHomeButton(true);
        return;
      }
      if (session) {
        stripSensitiveAuthParamsFromUrl();
        router.replace("/");
        router.refresh();
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        authCallbackWarn("getUser エラー", userError.message);
        setMessage(userError.message);
        setShowHomeButton(true);
        return;
      }
      if (user) {
        stripSensitiveAuthParamsFromUrl();
        router.replace("/");
        router.refresh();
        return;
      }

      authCallbackDebug("セッション確立失敗", {
        paramSummary: summarizeAuthCallbackParams(params),
      });
      setMessage(
        "セッションを開始できませんでした。招待リンクの有効期限が切れているか、既に使用済みの可能性があります。管理者に再招待を依頼するか、ログイン画面からお試しください。",
      );
      setShowHomeButton(true);
    })();
  }, [router]);

  // 認証コールバックのコンテンツを返す
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-slate-800">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-center text-sm leading-relaxed">{message}</p>
        {showHomeButton ? (
          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => router.replace("/")}
          >
            トップへ
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return <AuthCallbackContent />;
}
