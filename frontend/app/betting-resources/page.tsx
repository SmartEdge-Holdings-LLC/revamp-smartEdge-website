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
      <div className="relative px-4 sm:px-5 md:px-6 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-4 sm:mb-6">
            Betting Resources
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-slate-300">
            Master the fundamentals and terminology of sports betting with our comprehensive guides
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 md:px-6 py-8 sm:py-12 md:py-20">
        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={resource.href}
              className="group cursor-pointer"
            >
              <div className="flex h-full w-full flex-col overflow-hidden rounded-lg sm:rounded-2xl border border-white/10 bg-white/2 transition-all duration-300 hover:border-white/20 hover:shadow-[0_4px_24px_rgb(0_0_0/0.45)]">
                {/* Image */}
                <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden bg-white/5">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col space-y-3 sm:space-y-4 p-4 sm:p-6 md:p-8">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white transition-colors">
                      {resource.title}
                    </h2>
                  </div>
                  <p className="flex-1 text-xs sm:text-sm md:text-base leading-relaxed text-slate-300">
                    {resource.description}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-white transition-colors group-hover:text-white/80">
                    <span>Read Full Guide</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 sm:mt-16 md:mt-20 space-y-4 sm:space-y-6 rounded-lg sm:rounded-2xl border border-white/10 bg-white/2 p-4 sm:p-6 md:p-8 lg:p-12">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Why Learn These Resources?</h3>
          <ul className="space-y-3 sm:space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
              <span className="text-xs sm:text-sm md:text-base text-slate-300">Understand the fundamentals of sports betting and how to place informed bets</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
              <span className="text-xs sm:text-sm md:text-base text-slate-300">Learn essential betting terminology to speak the language of professional bettors</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
              <span className="text-xs sm:text-sm md:text-base text-slate-300">Master different betting strategies and manage your bankroll responsibly</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/40" />
              <span className="text-xs sm:text-sm md:text-base text-slate-300">Develop a strong foundation for long-term betting success</span>
            </li>
          </ul>
        </div>
      </div>
      </main>
      <LandingFooter />
    </div>
  );
}
