"use client";

import * as React from "react";

export function ContactUsContent() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const mailtoHref = React.useMemo(() => {
    const to = "support@smartedgepicks.com";
    const nextSubject = encodeURIComponent(subject.trim() || "Contact request from SmartEdgePicks");
    const bodyLines = [
      `Name: ${fullName.trim() || "-"}`,
      `Email: ${email.trim() || "-"}`,
      "",
      message.trim() || "No message provided.",
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    return `mailto:${to}?subject=${nextSubject}&body=${body}`;
  }, [email, fullName, message, subject]);

  return (
    <section className="relative z-10 flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-6 md:pb-32 md:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
            Contact us
          </div>
          <h1 className="typo-hero-title mt-6 text-white">We are here to help</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-subtle md:text-xl">
            Questions about plans, picks, billing, or account access? Send us a message and our
            team will get back to you.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-200">Full name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 w-full rounded-md border border-white/10 bg-[#131313] px-3 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-accent/60"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-200">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-md border border-white/10 bg-[#131313] px-3 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-accent/60"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-zinc-200">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                className="h-11 w-full rounded-md border border-white/10 bg-[#131313] px-3 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-accent/60"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-zinc-200">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Write your message..."
                className="w-full resize-y rounded-md border border-white/10 bg-[#131313] px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-accent/60"
              />
            </label>

            <a
              href={mailtoHref}
              className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
            >
              Send message
            </a>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Support channels</h2>
            <div className="mt-4 space-y-4 text-sm text-zinc-300">
              <p>
                <span className="block text-zinc-500">Email</span>
                <a href="mailto:support@smartedgepicks.com" className="text-white hover:text-accent">
                  support@smartedgepicks.com
                </a>
              </p>
              <p>
                <span className="block text-zinc-500">Business hours</span>
                Mon - Fri, 9:00 AM - 6:00 PM (ET)
              </p>
              <p>
                <span className="block text-zinc-500">Response time</span>
                Usually within 24 hours
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
