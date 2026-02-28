'use client';
import Link from 'next/link';

interface AdnodeLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 'w-8 h-8', text: 'text-xl' },
  md: { icon: 'w-10 h-10', text: 'text-2xl' },
  lg: { icon: 'w-12 h-12', text: 'text-3xl' },
};

export default function AdnodeLogo({ href = '/', size = 'md', showText = true, className = '' }: AdnodeLogoProps) {
  const { icon, text } = sizes[size];
  const content = (
    <>
      <div
        className={`${icon} rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg`}
        aria-hidden
      >
        <span className="text-white font-bold text-sm">Ad</span>
      </div>
      {showText && (
        <span className={`font-bold adnode-gradient-text ${text} tracking-tight`}>
          Adnode
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`inline-flex items-center gap-2.5 ${className}`}>
        {content}
      </Link>
    );
  }
  return <div className={`inline-flex items-center gap-2.5 ${className}`}>{content}</div>;
}
