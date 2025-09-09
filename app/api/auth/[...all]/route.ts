import { toNextJsHandler } from "better-auth/next-js";
import { handler } from "@/auth-kit/server";
export const { GET, POST } = toNextJsHandler(handler);
