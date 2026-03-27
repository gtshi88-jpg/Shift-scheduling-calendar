
// このファイルはセッション管理のファイルです
// このファイルはセッションを作成して、セッションを解析するためのファイルです
// このファイルはセッションを作成して、セッションを解析するためのファイルです
// このファイルはセッションを作成して、セッションを解析するためのファイルです
// このファイルはセッションを作成して、セッションを解析するためのファイルです 
import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthUser, UserRole } from "@/app/types";

type SessionPayload = {
  username: string;
  role: UserRole;
  exp: number;
};

type LoginUser = {
  username: string;
  password: string;
  role: UserRole;
};

const SESSION_COOKIE = "shift_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;

const LOGIN_USERS: LoginUser[] = [
  {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin1234",
    role: "admin",
  },
  {
    username: process.env.MEMBER_USERNAME ?? "member",
    password: process.env.MEMBER_PASSWORD ?? "member1234",
    role: "member",
  },
];

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-only-session-secret-change-this";
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(input: string): string {
  return createHmac("sha256", sessionSecret()).update(input).digest("base64url");
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function createSessionToken(user: AuthUser): string {
  const payload: SessionPayload = {
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function parseSessionToken(token: string | undefined): AuthUser | null {
  if (!token) {
    return null;
  }
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const expectedSignature = sign(payloadPart);
  const actualBuffer = Buffer.from(signaturePart);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart)) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (payload.role !== "admin" && payload.role !== "member") {
      return null;
    }
    return {
      username: payload.username,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function verifyCredentials(username: string, password: string): AuthUser | null {
  const user = LOGIN_USERS.find(
    (candidate) => candidate.username === username && candidate.password === password,
  );
  if (!user) {
    return null;
  }
  return { username: user.username, role: user.role };
}
