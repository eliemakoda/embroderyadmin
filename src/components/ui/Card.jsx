export default function Card({ 
  children, 
  className = '',
  padding = 'default',
  shadow = 'default',
  ...props 
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={`
        bg-surface-50 border border-surface-200 rounded-lg
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}