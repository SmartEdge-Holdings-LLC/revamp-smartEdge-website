import { Request, Response, NextFunction } from "express";

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

export function cacheMiddleware(ttlSeconds: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(cacheKey);

    // Set cache headers for browser caching
    res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}`);
    res.setHeader("Pragma", "cache");

    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cached.data);
    }

    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds,
      });
      return originalJson(data);
    };

    next();
  };
}

export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}
