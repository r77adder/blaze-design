import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Input.module.scss';

export type InputSize = 'sm' | 'md';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Chrome size. Defaults to `md`. */
  inputSize?: InputSize;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = 'md', fullWidth, className, ...rest }, ref) => {
    const classes = [
      styles.root,
      styles[`size-${inputSize}`],
      fullWidth ? styles.fullWidth : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <input ref={ref} className={classes} {...rest} />;
  },
);
Input.displayName = 'Input';
