import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

/**
 * Proxies Admin-API requests to the backend and forwards the Cookie header
 * so HttpOnly auth works with same-origin requests (Dev und Prod).
 * Verwendet in beiden Umgebungen, damit das Cookie unabhängig von Port/Host
 * (z. B. Frontend Vercel, Backend Railway) zuverlässig gesetzt und mitgesendet wird.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

async function proxy(
  request: NextRequest,
  { path }: { path: string[] }
): Promise<NextResponse> {
  const pathStr = path.join("/");
  const url = new URL(pathStr, `${BACKEND_URL}/`);
  const cookie = request.headers.get("cookie");

  const headers: HeadersInit = {
    "Content-Type": request.headers.get("content-type") || "application/json",
  };
  if (cookie) headers["Cookie"] = cookie;

  let body: string | undefined;
  try {
    body = await request.text();
  } catch {
    // no body
  }

  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    body: body || undefined,
  });

  const data = await res.text();
  const response = new NextResponse(data, {
    status: res.status,
    statusText: res.statusText,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });

  // Forward Set-Cookie so the browser stores the auth cookie for this origin
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    // Next.js expects Set-Cookie as multiple headers or a single combined one
    response.headers.set("Set-Cookie", setCookie);
  }

  return response;
}
