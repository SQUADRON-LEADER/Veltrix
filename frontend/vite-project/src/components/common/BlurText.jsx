import { motion } from 'framer-motion';

export default function BlurText({ text, className = '', delay = 0 }) {
  const words = text.split(' ');

  return (
    <div className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 100,
            delay: delay + index * 0.05,
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
