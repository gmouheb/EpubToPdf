import { NextRequest } from "next/server";

interface IpLimitRecord {
  count: number;
  resetAt: number;
}

interface IpLimitStore {
  records: Map<string, IpLimitRecord>;
}

export interface IpLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

const globalForRateLimit = globalThis as typeof globalThis & {
  epubToPdfIpLimitStore?: IpLimitStore;
};

const store =
  globalForRateLimit.epubToPdfIpLimitStore ??
  (globalForRateLimit.epubToPdfIpLimitStore = {
    records: new Map<string, IpLimitRecord>()
  });

const maxConversions = Number(process.env.IP_CONVERSION_LIMIT_MAX_FILES ?? 3);
const windowSeconds = Number(
  process.env.IP_CONVERSION_LIMIT_WINDOW_SECONDS ??
    Number(process.env.IP_CONVERSION_LIMIT_WINDOW_MINUTES ?? 30) * 60
);
const windowMs = windowSeconds * 1000;

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function consumeIpConversionSlot(ip: string): IpLimitResult {
  const now = Date.now();
  const current = store.records.get(ip);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    store.records.set(ip, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: Math.max(maxConversions - 1, 0),
      resetAt,
      retryAfterSeconds: 0
    };
  }

  if (current.count >= maxConversions) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1)
    };
  }

  current.count += 1;
  store.records.set(ip, current);

  return {
    allowed: true,
    remaining: Math.max(maxConversions - current.count, 0),
    resetAt: current.resetAt,
    retryAfterSeconds: 0
  };
}

export function formatRetryMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(Math.ceil(retryAfterSeconds / 60), 1);
  return `You have reached the limit of ${maxConversions} EPUB conversions. Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before trying again.`;
}
