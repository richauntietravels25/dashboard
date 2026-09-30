import { NextRequest, NextResponse } from "next/server";

// Personal app: everything sits behind one password (HTTP Basic auth, any username).
export function middleware(req: NextRequest) {
  const pw = process.env.DASHBOARD_PASSWORD;
  if (!pw) return new NextResponse("DASHBOARD_PASSWORD is not set", { status: 500 });
  const h = req.headers.get("authorization");
  if (h?.startsWith("Basic ")) {
    const decoded = atob(h.slice(6));
    if (decoded.slice(decoded.indexOf(":") + 1) === pw) return NextResponse.next();
  }
  return new NextResponse("Sign in required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Dashboard"' },
  });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
