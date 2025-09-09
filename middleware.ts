export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

export { authMiddleware as middleware } from "@/auth-kit/middleware";
