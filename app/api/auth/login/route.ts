import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

function looksLikeSupabaseReturnedHtml(errorMessage: string): boolean {
  const m = errorMessage.toLowerCase();
  return (
    m.includes("unexpected token") ||
    m.includes("<!doctype") ||
    m.includes("is not valid json") ||
    m.includes("invalid json")
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; username?: string; password?: string };
    const email = (body.email ?? body.username ?? "").trim();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "メールアドレスとパスワードを入力してください" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createSupabaseAuthServerClient(cookieStore);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[auth/login] signInWithPassword:", error.message);
      const em = error.message.toLowerCase();
      let message = "メールアドレスまたはパスワードが正しくありません";
      if (looksLikeSupabaseReturnedHtml(error.message)) {
        message =
          "Supabase への接続に失敗しています（認証 API が JSON ではなく HTML を返しています）。ダッシュボードの Settings → API の Project URL と .env の SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL が完全に一致するか、プロジェクトが一時停止していないか確認してください。";
      } else if (em.includes("email logins are disabled")) {
        message =
          "メール／パスワードでのログインが Supabase で無効です。ダッシュボード → Authentication → Providers → Email を開き、「Enable Email provider」をオンにしてください。";
      } else if (em.includes("email not confirmed") || em.includes("not confirmed")) {
        message =
          "メールアドレスの確認がまだです。受信したメールのリンクを開くか、Supabase でユーザーを「確認済み」にしてください。";
      } else if (em.includes("user_banned") || em.includes("banned")) {
        message = "このアカウントは利用できません。管理者に連絡してください。";
      } else if (process.env.NODE_ENV === "development") {
        message = `${message}（開発用詳細: ${error.message}）`;
      }
      return NextResponse.json({ ok: false, message }, { status: 401 });
    }

    const user = await getAuthUser();
    if (!user) {
      console.error(
        "[auth/login] getAuthUser が null（セッション Cookie の保存失敗や DB 参照エラーの可能性）。.env のプロジェクトとダッシュボードが一致しているか確認してください。",
      );
      return NextResponse.json(
        {
          ok: false,
          message:
            "ログイン後のユーザー情報の取得に失敗しました。環境変数の Supabase プロジェクトを確認してください。",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error("[auth/login] 例外:", e);
    return NextResponse.json(
      { ok: false, message: "ログイン処理中にサーバーエラーが発生しました。ターミナルのログを確認してください。" },
      { status: 500 },
    );
  }
}
