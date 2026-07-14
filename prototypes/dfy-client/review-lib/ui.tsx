import styles from './ui.module.scss';

/* ui helpers copied verbatim from prototypes/blaze-dfy/ui.tsx, only the ones
 * the client strategy review uses. TextArea is the multi-line field the review
 * note + inline edits render through. */

/** Multi-line field, the lib has no standard textarea, so this stays a local
 *  field styled to match the TextField chrome. */
export function TextArea({ fullWidth = true, style, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { fullWidth?: boolean }) {
  return (
    <textarea
      {...props}
      className={[styles.textArea, className].filter(Boolean).join(' ')}
      style={{ ...(fullWidth ? { width: '100%', boxSizing: 'border-box' as const } : null), minHeight: 88, ...style }}
    />
  );
}

const GRADIENTS = ['linear-gradient(135deg,#A78BFA,#7C3AED)', 'linear-gradient(135deg,#60A5FA,#2563EB)', 'linear-gradient(135deg,#34D399,#059669)', 'linear-gradient(135deg,#F472B6,#DB2777)', 'linear-gradient(135deg,#FB923C,#EA580C)', 'linear-gradient(135deg,#FBBF24,#D97706)', 'linear-gradient(135deg,#FCA5A5,#DC2626)', 'linear-gradient(135deg,#0EA5E9,#0369A1)'];
export function gradientFor(seed: number) { return GRADIENTS[(seed - 1) % GRADIENTS.length]; }
