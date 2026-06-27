"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface NewsItem {
  _id: string;
  title: string;
  description?: string;
  cta?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const fetchActiveNews = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error("Backend URL not configured");
        }

        const res = await fetch(`${backendUrl}/api/news/active/current`);
        const data = await res.json();

        if (res.ok) {
          setNews(data.news);
        } else {
          setError(data.error || "Failed to load news");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load news";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchActiveNews();
  }, []);

  if (loading || error || !news || closed) {
    return null;
  }

  return (
    <div className="pricing-accent-gradient gradient-animate px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-bold uppercase text-sm sm:text-base text-white leading-tight">
              {news.title}
            </p>
            {news.description && (
              <p className="text-xs sm:text-sm font-normal text-white/85 mt-1.5 leading-relaxed">
                {news.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {news.cta ? (
              <a
                href={news.cta}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-white/90 transition-colors"
              >
                Learn More
              </a>
            ) : (
              <Link
                href="/contact-us"
                className="inline-flex whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-white/90 transition-colors"
              >
                Learn More
              </Link>
            )}

           
          </div>
        </div>
      </div>
    </div>
  );
}
