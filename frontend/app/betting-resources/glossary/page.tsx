'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/sections/LandingFooter';

export default function GlossaryPage() {
  const [expandedCategory, setExpandedCategory] = useState<string>('betting-basics');

  const glossaryTerms = {
    'betting-basics': {
      title: 'Betting Basics',
      terms: [
        {
          term: 'Action',
          definition: 'The act of placing a bet on a game or event. When you hear "I have action on tonight\'s game," it means someone has a stake in the outcome.',
        },
        {
          term: 'Book (Sportsbook)',
          definition: 'The establishment or platform where bettors can place their wagers. Whether online or brick-and-mortar, sportsbooks are the arenas where odds come to life.',
        },
        {
          term: 'Favorite',
          definition: 'The competitor or team perceived most likely to win, often represented with minus (-) odds. Betting on the favorite typically means expecting a dominant performance.',
        },
        {
          term: 'Handicapper',
          definition: 'A person who analyzes sports events to predict the winners. Handicappers consider various factors from statistical trends to weather conditions.',
        },
        {
          term: 'Odds',
          definition: 'A numerical expression of the likelihood of a particular outcome, dictating both the potential payout and the implied probability of an event.',
        },
        {
          term: 'Underdog',
          definition: 'The competitor less expected to win, usually offering a higher payout due to increased risk. Backing the underdog can lead to significant rewards.',
        },
      ],
    },
    'betting-types': {
      title: 'Betting Types',
      terms: [
        {
          term: 'Moneyline Bet',
          definition: 'The simplest form of betting — pick the winner, and if they triumph, so do you. Moneyline bets focus on the outright winner, making them a favorite for beginners.',
        },
        {
          term: 'Point Spread',
          definition: 'This bet levels the playing field between unevenly matched teams. If you bet on the favorite, they must win by more than the spread.',
        },
        {
          term: 'Total Bet (Over/Under)',
          definition: 'Instead of picking winners, you bet on the total score of a game, deciding whether it will be over or under the sportsbook\'s prediction.',
        },
        {
          term: 'Parlay',
          definition: 'A high-risk, high-reward bet that combines multiple selections into one wager. All picks must win for the parlay to pay out, offering potentially large payouts.',
        },
        {
          term: 'Prop Bet (Proposition Bet)',
          definition: 'These bets focus on specific events within a game rather than the game\'s outcome, from predicting which player scores first to guessing total yards.',
        },
        {
          term: 'Futures Bet',
          definition: 'Futures bets are placed on events or outcomes that will be decided in the future, such as championship winners or award recipients.',
        },
      ],
    },
    'odds-calculations': {
      title: 'Odds and Calculations',
      terms: [
        {
          term: 'American Odds',
          definition: 'Centered around winning or wagering $100, American odds are displayed as positive or negative numbers. Negative odds indicate how much you must bet to win $100.',
        },
        {
          term: 'Decimal Odds',
          definition: 'Popular in Europe and Canada, decimal odds show your total payout for every $1 wagered. Simply multiply your stake by the decimal odds to calculate total return.',
        },
        {
          term: 'Fractional Odds',
          definition: 'These odds are represented as fractions, such as 5/1, indicating how much profit you\'ll gain on top of your stake.',
        },
        {
          term: 'Implied Probability',
          definition: 'Implied probability is derived from betting odds, offering insight into the likelihood of an outcome based on the odds presented by sportsbooks.',
        },
        {
          term: 'Vig (Vigorish)',
          definition: 'The commission that sportsbooks take on bets. It\'s typically built into the odds, ensuring the house gains a profit regardless of outcome.',
        },
      ],
    },
    'betting-strategies': {
      title: 'Betting Strategies',
      terms: [
        {
          term: 'Value Betting',
          definition: 'This strategy involves identifying bets that offer higher odds than their actual winning chances. If you believe the chance is greater than odds suggest, you\'ve found value.',
        },
        {
          term: 'Bankroll Management',
          definition: 'Essential for every bettor, this strategy focuses on controlling your betting funds wisely by setting aside specific amounts and determining wager size.',
        },
        {
          term: 'Hedging',
          definition: 'This risk management strategy allows you to secure profits or minimize losses by placing a bet on the opposite outcome of your original wager.',
        },
        {
          term: 'Line Shopping',
          definition: 'The practice of comparing odds and lines across different sportsbooks to find the most favorable conditions for your bets.',
        },
        {
          term: 'Arbitrage Betting',
          definition: 'By placing bets on all possible outcomes across different sportsbooks, you can guarantee a profit regardless of the result.',
        },
      ],
    },
  };

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
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-subtle">Betting Glossary</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Sports Betting Terms Glossary
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-subtle sm:text-lg">
              Master the essential terminology of sports betting. Learn key terms and concepts to make informed betting decisions.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-5 sm:py-16 md:px-6 md:py-20">
          {/* Intro Card */}
          <div className="mb-12 space-y-4 rounded-lg border border-white/5 bg-[#161616] p-6 sm:p-8 md:p-10">
            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              Diving into sports betting without knowing the lingo is like trying to navigate a ship in foggy waters. Our comprehensive glossary turns the complex world of sports wagering into clear sailing, offering you a treasure trove of terms to speak the language of professional bettors.
            </p>
          </div>

          {/* Glossary Categories */}
          <div className="space-y-4">
            {Object.entries(glossaryTerms).map(([categoryId, category]) => (
              <div key={categoryId} className="overflow-hidden rounded-lg border border-white/5 bg-[#161616]">
                {/* Category Header */}
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === categoryId ? '' : categoryId
                    )
                  }
                  className="w-full flex items-center justify-between px-6 py-5 transition-colors hover:bg-white/2 sm:px-8 sm:py-6"
                >
                  <h2 className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                    {category.title}
                  </h2>
                  <div
                    className={`shrink-0 transition-transform ${
                      expandedCategory === categoryId ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown className="h-5 w-5 text-white/60 sm:h-6 sm:w-6" />
                  </div>
                </button>

                {/* Category Content */}
                {expandedCategory === categoryId && (
                  <div className="border-t border-white/5 px-6 pb-6 sm:px-8 sm:pb-8">
                    <div className="space-y-6">
                      {category.terms.map((item, idx) => (
                        <div key={idx} className="space-y-3">
                          <h3 className="font-semibold text-white text-base sm:text-lg">
                            {item.term}
                          </h3>
                          <p className="leading-relaxed text-slate-300 text-sm sm:text-base">
                            {item.definition}
                          </p>
                          {idx < category.terms.length - 1 && (
                            <div className="h-px bg-white/5 mt-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Section */}
          <div className="mt-16 overflow-hidden rounded-lg border border-white/5 bg-linear-to-r from-white/2 to-white/1 p-8 sm:p-10 md:p-12">
            <div className="max-w-2xl">
              <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                Master the Terminology
              </h3>
              <p className="mb-8 leading-relaxed text-subtle text-sm sm:text-base">
                By familiarizing yourself with these terms and their meanings, you're not just betting; you're strategically investing in sports events. Understanding the language of sports betting empowers you to make more educated decisions and enhance your overall betting experience.
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
