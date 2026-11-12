import { motion } from 'framer-motion';

interface SegmentedTabOption {
  value: string;
  label: string;
}

interface SegmentedTabsProps {
  options: SegmentedTabOption[];
  value: string;
  onChange: (value: string) => void;
  accent: 'food' | 'fit';
}

const accentClass = {
  food: {
    activeText: 'text-food',
    slider: 'border-food/70 shadow-[0_0_24px] shadow-food/35',
  },
  fit: {
    activeText: 'text-fit',
    slider: 'border-fit/70 shadow-[0_0_24px] shadow-fit/35',
  },
};

export function SegmentedTabs({
  options,
  value,
  onChange,
  accent,
}: SegmentedTabsProps) {
  if (options.length === 0) {
    return null;
  }

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedStyle = {
    left: `calc(${(selectedIndex / options.length) * 100}% + 4px)`,
    width: `calc(${100 / options.length}% - 8px)`,
  };
  const classes = accentClass[accent];

  return (
    <div className="relative flex h-11 rounded-[14px] bg-surface p-1">
      <motion.div
        className={`pointer-events-none absolute inset-y-1 rounded-[10px] border ${classes.slider}`}
        layoutId={`segmented-tab-${accent}`}
        style={selectedStyle}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      />
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={`relative z-10 flex min-w-0 flex-1 items-center justify-center rounded-[10px] px-3 text-sm font-medium transition-transform active:scale-[0.97] ${
              isSelected ? classes.activeText : 'text-muted'
            }`}
            onClick={() => onChange(option.value)}
          >
            <span className="min-w-0 truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
