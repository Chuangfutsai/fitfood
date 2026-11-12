import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  accent?: 'food' | 'fit';
}

const accentGlowClass = {
  food: 'bg-food/35',
  fit: 'bg-fit/35',
};

export function Card({ children, className, accent }: CardProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[20px] border border-line bg-surface p-4 ${className ?? ''}`}
    >
      {accent && (
        <div
          className={`pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full blur-2xl ${accentGlowClass[accent]}`}
        />
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
