import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Skull, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[70vh] flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-accent-red/30 bg-accent-red/5"
        style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.15)' }}
      >
        <Skull className="h-10 w-10 text-accent-red/70" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-5xl tracking-wide text-accent-red/80"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-3 font-heading text-lg tracking-wider text-text-secondary"
      >
        You wandered into the Dark Forest...
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-2 max-w-sm text-sm text-text-muted"
      >
        This path leads nowhere. The quest you seek does not exist in this realm.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="group mt-8 flex items-center gap-2 rounded-xl border border-accent-gold-dim/40 bg-accent-gold/5 px-6 py-2.5 font-heading text-sm tracking-widest text-accent-gold uppercase backdrop-blur-sm transition-all hover:border-accent-gold/60 hover:bg-accent-gold/10"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Return to Safety
      </motion.button>
    </motion.div>
  )
}
