import { verifyToken } from "@clerk/backend";

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code: string = "HTTP_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export async function requireSession(request: Request): Promise<{ userId: string }> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid authorization header", "UNAUTHORIZED");
  }

  const token = authHeader.replace(/^Bearer\s+/, "").trim();
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    console.error("CLERK_SECRET_KEY is not configured on the server");
    throw new HttpError(500, "Server configuration error", "CONFIG_ERROR");
  }

  try {
    const verified = await verifyToken(token, {
      secretKey,
    });

    if (!verified || !verified.sub) {
      throw new HttpError(401, "Invalid session token", "INVALID_TOKEN");
    }

    return { userId: verified.sub };
  } catch (err: unknown) {
    if (err instanceof HttpError) throw err;
    const msg = err instanceof Error ? err.message : "Authentication failed";
    console.warn("Clerk token verification failed:", msg);
    throw new HttpError(401, "Unauthorized session", "UNAUTHORIZED");
  }
}


