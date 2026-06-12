import * as React from 'react';
import { clsx } from '@/lib/utils';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          styles.button,
          styles[variant],
          styles[size],
          isLoading && styles.loading,
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className={styles.spinner} aria-hidden="true" />
        )}
        <span className={clsx(styles.content, isLoading && styles.hidden)}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
