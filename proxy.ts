import { NextResponse, type NextRequest } from "next/server";
import { buildCsp } from "@/lib/security";

// Per-request nonce for a strict script CSP (D-022). Next reads the nonce from the request header.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|icon.svg|illustrations/).*)",
      missing: [{ type: "header", key: "next-router-prefetch" }],
    },
  ],
};
