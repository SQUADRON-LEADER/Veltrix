import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) {
  const variantMap = {
    primary:   'btn btn-primary',
    secondary: 'btn btn-secondary',
    outline:   'btn btn-outline',
    ghost:     'btn btn-ghost',
    white:     'btn btn-secondary',
    danger:    'btn btn-danger',
  };

  const sizeMap = {
    sm: 'text-xs px-3 py-1',
    md: '',
    lg: 'text-sm px-5 py-2',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${variantMap[variant] || variantMap.primary} ${sizeMap[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </motion.button>
  );
}
