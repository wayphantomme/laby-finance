// IP-based rate limiting for the NextAuth credentials callback requires middleware-level interception (not a direct route edit) and is deferred to a future iteration.
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
