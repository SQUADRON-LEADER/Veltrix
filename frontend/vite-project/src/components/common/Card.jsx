import { motion } from 'framer-motion';

export default function Card({ 
  children, 
  hover = false, 
  className = '',
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`${hover ? 'card-hover' : 'card'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
