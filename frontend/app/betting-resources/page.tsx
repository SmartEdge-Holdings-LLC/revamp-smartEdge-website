'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/sections/LandingFooter';

export default function BettingResourcesPage() {
  const resources = [
    {
      id: 'beginners-guide',
      title: "Beginner's Guide to Sports Betting",
      description: "New to sports betting? Our quick start guide offers the betting strategies and tips you need to bet smart.",
      href: '/betting-resources/beginners-guide',
      image: '/resources/resources-1.jpg',
    },
    {
      id: 'glossary',
      title: 'Sports Betting Terms Glossary',
      description: 'Get the edge in sports betting with our detailed glossary. Boost your betting IQ by learning the essential terms to make informed bets.',
      href: '/betting-resources/glossary',
      image: '/resources/resources-2.jpg',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-slate-100">
      <Navbar />
      <main className="flex-1">
      {/* Header */}
      <div className="relative px-4 py-16 sm:px-5 sm:py-20 md:px-6 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl mb-6">
            Betting Resources
          </h1>
          <p className="text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl">
            Master the fundamentals and terminology of sports betting with our comprehensive guides
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-16 md:px-6 md:py-20">
        <div className="grid gap-8 md:grid-cols-2">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={resource.href}
              className="group cursor-pointer"
            >
              <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 hover:border-white/20 hover:shadow-[0_4px_24px_rgb(0_0_0/0.45)]">
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-white/5">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col space-y-4 p-6 sm:p-8">
                  <div>
                    <h2 className="text-xl font-bold text-white transition-colors sm:text-2xl md:text-2xl">
                      {resource.title}
                    </h2>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {resource.description}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center gap-2 font-semibold text-white transition-colors group-hover:text-white/80">
                    <span>Read Full Guide</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-20 space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 md:p-12">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">Why Learn These Resources?</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
              <span className="text-slate-300">Understand the fundamentals of sports betting and how to place informed bets</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
              <span className="text-slate-300">Learn essential betting terminology to speak the language of professional bettors</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
              <span className="text-slate-300">Master different betting strategies and manage your bankroll responsibly</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
              <span className="text-slate-300">Develop a strong foundation for long-term betting success</span>
            </li>
          </ul>
        </div>
      </div>
      </main>
      <LandingFooter />
    </div>
  );
}
