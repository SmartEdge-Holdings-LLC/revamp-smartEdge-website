'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/sections/LandingFooter';

export default function BeginnersGuidePage() {
  const sections = [
    {
      id: 'welcome',
      title: 'Welcome to the World of Sports Betting',
      subsections: [
        {
          subtitle: 'The Thrill of the Game',
          content: 'Sports betting is more than just placing wagers; it\'s about being part of the game in a way that few other experiences can match. It offers the unique opportunity to apply your knowledge of sports, understanding of odds, and strategic thinking to predict outcomes and potentially reap rewards.\n\nWhether you\'re cheering for your favorite team or betting on the performance of a star athlete, sports betting adds a layer of excitement to every match, game, and tournament.',
        },
        {
          subtitle: 'A Growing Global Phenomenon',
          content: 'The popularity of sports betting has seen a meteoric rise, particularly with the advent of online platforms that make placing bets more accessible than ever before. This surge in interest is not just about the potential financial gains; it\'s also about the community and camaraderie that come with sharing predictions, experiences, and tips with fellow bettors.\n\nFrom the bright lights of Las Vegas to the digital domains where virtual sportsbooks reside, the world of sports betting is at your fingertips, offering endless opportunities for entertainment and engagement.',
        },
      ],
    },
    {
      id: 'basics',
      title: 'Understanding Sports Betting: The Basics',
      subsections: [
        {
          subtitle: 'What Is Sports Betting?',
          content: 'At its simplest, sports betting involves placing a wager on the outcome of a sports event. The beauty of sports betting lies in its diversity; you can bet on virtually any sport, from mainstream favorites like football and basketball to niche markets such as table tennis and eSports.\n\nThe objective is straightforward: predict the outcome correctly, and you win.',
        },
        {
          subtitle: 'The Legal Landscape',
          content: 'The legal status of sports betting has undergone significant transformations, particularly in the United States. The Professional and Amateur Sports Protection Act (PASPA) of 1992 effectively outlawed sports betting nationwide, with few exceptions. However, in May 2018, the Supreme Court struck down PASPA, opening the doors for states to legalize and regulate sports betting as they see fit.',
        },
      ],
    },
    {
      id: 'bet-types',
      title: 'Exploring Different Types of Sports Bets',
      subsections: [
        {
          subtitle: 'Moneyline Bets',
          content: 'Moneyline bets are the simplest form of sports betting, where you pick the winner of a match or event. The odds indicate the potential return on a winning bet. For example, if the Yankees are -150 against the Red Sox at +130, a $150 bet on the Yankees would net $100 if they win.',
        },
        {
          subtitle: 'Point Spreads',
          content: 'Point spreads are designed to make betting on uneven matches more interesting. The favorite must cover the spread for a bet on them to pay out. For instance, if the Lakers are -7.5, they need to win by 8 points or more for a bet to win.',
        },
        {
          subtitle: 'Parlays',
          content: 'Parlays allow you to combine multiple bets into one wager. For the parlay to win, all individual bets must win. The appeal lies in high payouts with small investments, but they come with increased risk.',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-slate-100">
      <Navbar />
      <main className="flex-1 bg-black">
        {/* Back Button */}
        <div className="fixed top-20 left-4 z-10">
          <Link
            href="/betting-resources"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black hover:bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-all duration-300 hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/5 bg-linear-to-b from-white/2 to-transparent px-4 py-16 sm:px-5 sm:py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-subtle">Sports Betting Guide</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Beginner's Guide to Sports Betting
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-subtle sm:text-lg">
              Master the fundamentals of sports betting with our comprehensive guide. Learn betting strategies, understand odds, and discover how to place informed bets.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-5 sm:py-16 md:px-6 md:py-20">
          {/* Intro Card */}
          <div className="mb-12 space-y-4 rounded-lg border border-white/5 bg-[#161616] p-6 sm:p-8 md:p-10">
            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              Whether you're a seasoned enthusiast or taking your first step into this dynamic arena, this guide is designed to navigate you through the essentials of sports gambling. You'll discover strategies, tips, and the importance of responsible gambling, all crafted to kickstart your journey with confidence.
            </p>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} className="mb-12">
              <div className="mb-8">
                <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-6">
                {section.subsections.map((sub, idx) => (
                  <div key={idx} className="rounded-lg border border-white/5 bg-[#161616] p-6 sm:p-8">
                    <h3 className="mb-4 text-lg font-semibold text-white sm:text-xl">
                      {sub.subtitle}
                    </h3>
                    <div className="space-y-3 text-slate-300">
                      {sub.content.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} className="leading-relaxed text-sm sm:text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA Card */}
          <div className="mt-16 overflow-hidden rounded-lg border border-white/5 bg-linear-to-r from-white/2 to-white/1 p-8 sm:p-10 md:p-12">
            <div className="max-w-2xl">
              <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                Ready to Start Your Journey?
              </h3>
              <p className="mb-8 leading-relaxed text-subtle text-sm sm:text-base">
                You now have the foundation to begin your sports betting journey with confidence. Explore our complete resources library to deepen your knowledge and refine your strategies.
              </p>
              <Link
                href="/betting-resources"
                className="pricing-accent-gradient inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]"
              >
                Back to Resources
              </Link>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
