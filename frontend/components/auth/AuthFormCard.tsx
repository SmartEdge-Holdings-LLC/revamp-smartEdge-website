import Image from "next/image";
import Link from "next/link";

export function AuthFormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[540px]">
      <div className="rounded-2xl border border-white/12 bg-white/6 p-8 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08),0_24px_80px_-32px_rgb(0_0_0/0.85)] backdrop-blur-2xl md:p-10">
        {children}
      </div>
    </div>
  );
}

export function AuthFormHeader({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <Link
        href="/"
        className="mb-6 inline-flex max-w-full shrink-0 items-center justify-center rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-white/30"
      >
        <Image
          src="/logo.webp"
          alt="SmartEdgePicks"
          width={360}
          height={96}
          className="h-auto w-[min(100%,17.5rem)] object-contain drop-shadow-[0_2px_16px_rgb(0_0_0/0.55)] sm:w-[min(100%,20rem)]"
          sizes="(max-width: 440px) 280px, 320px"
          priority
          quality={95}
        />
      </Link>
      <h1 className="typo-heading-lg font-medium tracking-tight text-white">{title}</h1>
      <p className="mt-2 max-w-sm typo-body-md text-pretty text-slate-400">{description}</p>
    </div>
  );
}
