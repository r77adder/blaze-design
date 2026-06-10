import { forwardRef, type TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.scss';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Stretch to fill the container width. Defaults to `true`. */
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ fullWidth = true, className, ...rest }, ref) => {
    const classes = [styles.root, fullWidth ? styles.fullWidth : null, className]
      .filter(Boolean)
      .join(' ');

    return <textarea ref={ref} className={classes} {...rest} />;
  },
);
Textarea.displayName = 'Textarea';
