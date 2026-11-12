import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLang } from '../i18n/LanguageContext';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const { t } = useLang();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={t('common.closeSheet')}
            className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto  max-h-[85dvh] overflow-y-auto rounded-t-[28px] border-x border-t border-line bg-surface/85 px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+20px)] backdrop-blur-xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="min-w-0 truncate text-xl font-bold text-text">{title}</h2>
              <button
                type="button"
                aria-label={t('common.close')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-muted transition-transform active:scale-[0.97]"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
