import { forwardRef } from 'react';
import type { TextFieldProps } from './Types';
import styles from './TextField.module.scss';

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      size = 'md',
      onChange,
      invalid = false,
      fullWidth = false,
      type = 'text',
      className,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      styles.root,
      styles[`size-${size}`],
      invalid ? styles.invalid : null,
      fullWidth ? styles.fullWidth : null,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <input
        ref={ref}
        type={type}
        className={classes}
        aria-invalid={invalid || undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        {...rest}
      />
    );
  },
);
TextField.displayName = 'TextField';
