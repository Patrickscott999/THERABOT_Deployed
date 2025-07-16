import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbitron } from 'next/font/google';
import Image from 'next/image';

const titleFont = Orbitron({
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
});

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName }) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        delay: 0.3, 
        // Use specific animation type values instead of string
        type: "spring" as const, 
        stiffness: 400, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 30, 
      transition: { duration: 0.2 } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          {/* Backdrop with blur effect */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 border border-white/20 shadow-2xl shadow-black/50"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-1">
              <div className="flex items-center justify-between p-5">
                <h2 className={`text-2xl text-white font-bold tracking-wider ${titleFont.className}`}>Welcome to TheraBot</h2>
                <button
                  onClick={onClose}
                  className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal body */}
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-3xl">👋</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{userName || 'Friend'}!</span>
                  </h3>
                  <p className="text-gray-300 mt-1">We're glad you're here.</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-5 border border-white/5">
                <h4 className="text-lg font-semibold text-white mb-3">How TheraBot Can Help You:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-xl">💬</div>
                    <div>
                      <span className="font-medium text-white">Emotional Support</span>
                      <p className="text-gray-300 text-sm">Express your feelings freely in a safe, judgment-free space.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-xl">🧠</div>
                    <div>
                      <span className="font-medium text-white">Therapeutic Techniques</span>
                      <p className="text-gray-300 text-sm">Learn evidence-based coping strategies for stress, anxiety, and more.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-xl">🌱</div>
                    <div>
                      <span className="font-medium text-white">Personal Growth</span>
                      <p className="text-gray-300 text-sm">Track your emotional journey and celebrate your progress.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-5 border border-blue-700/20">
                <p className="text-center text-white italic">
                  "Healing begins with a conversation. I'm here to listen whenever you need me."
                </p>
                <p className="text-right text-blue-300 text-sm mt-2">— TheraBot</p>
              </div>
            </div>
            
            {/* Modal footer */}
            <div className="bg-slate-800/50 px-6 py-4 flex justify-between items-center border-t border-white/5">
              <div className="text-gray-300 text-sm">
                <span className="inline-block mr-2 opacity-70">🔒</span> Your conversations are private and secure
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20"
              >
                Start Chatting
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
