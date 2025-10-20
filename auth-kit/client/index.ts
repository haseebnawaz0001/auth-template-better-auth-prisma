"use client";
// Minimal client (same-origin now; flip to service later with baseURL).
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Service mode (later): point to your auth service:
  // baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL || "https://auth.example.com/api/auth",
});
