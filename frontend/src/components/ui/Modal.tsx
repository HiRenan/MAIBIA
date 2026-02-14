import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  accentColor?: string
}

export default function Modal({ open, onClose, children, title, accentColor = '#8b5cf6' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border-subtle/50 bg-bg-secondary/95 p-6 shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ boxShadow: `0 0 40px ${accentColor}15` }}
          >
            {/* Top glow */}
            <div
              className="absolute top-0 right-6 left-6 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }}
            />

            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-lg tracking-wide text-text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
