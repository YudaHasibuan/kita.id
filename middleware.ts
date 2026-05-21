import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Mengecek apakah cookie session dari NextAuth ada (versi localhost atau versi HTTPS/Vercel)
  const isLoggedIn = 
    req.cookies.has("authjs.session-token") || 
    req.cookies.has("__Secure-authjs.session-token");
    
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
  
  // Jika user belum login dan tidak berada di rute login/register, arahkan ke login
  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika user sudah login tapi mencoba mengakses halaman login/register, arahkan ke home
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Hanya jalankan middleware ini pada rute aplikasi kita (kecuali file statis, gambar, dan API auth)
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
