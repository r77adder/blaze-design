import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import ChevronDown from '../../icons/20/ChevronDown';
import type { SelectProps } from './Types';
import styles from './Select.module.scss';

/**
 * Select — on-brand dropdown. Renders a styled trigger + popover list instead
 * of the native `<select>`, so dropdowns match the rest of the Blaze chrome.
 *
 * The menu is rendered in a portal with fixed positioning so it can never be
 * clipped by an ancestor's `overflow: hidden` (e.g. a bordered table). See
 * `Select.module.scss` for the spec.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onChange, options, size = 'md', placeholder = 'Select…', fullWidth, optionAction, className, style, disabled, ...rest }, ref) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const selected = options.find((o) => o.value === value);

    const setTriggerRef = (el: HTMLButtonElement | null) => {
      triggerRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as MutableRefObject<HTMLButtonElement | null>).current = el;
    };

    useLayoutEffect(() => {
      if (!open) return;
      const reposition = () => {
        const el = triggerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
      };
      reposition();
      window.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);
      return () => {
        window.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
      };
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const onDocPointer = (e: MouseEvent) => {
        const t = e.target as Node;
        if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
        setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', onDocPointer);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDocPointer);
        document.removeEventListener('keydown', onKey);
      };
    }, [open]);

    const rootClasses = [styles.root, fullWidth ? styles.fullWidth : null, className].filter(Boolean).join(' ');
    const triggerClasses = [styles.trigger, styles[`size-${size}`], open ? styles.open : null].filter(Boolean).join(' ');

    return (
      <div className={rootClasses} style={style}>
        <button
          ref={setTriggerRef}
          type="button"
          className={triggerClasses}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          {...rest}
        >
          <span className={selected ? styles.value : `${styles.value} ${styles.placeholder}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown size={size === 'sm' ? 14 : 16} className={styles.chevron} />
        </button>
        {open && coords && typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={menuRef}
              className={[styles.menu, styles[`menu-${size}`]].filter(Boolean).join(' ')}
              role="listbox"
              style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: coords.width }}
            >
              {options.map((o) => {
                const ActionIcon = optionAction?.icon;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={o.value === value}
                    className={o.value === value ? `${styles.option} ${styles.optionSelected}` : styles.option}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                  >
                    <span className={styles.optionLabel}>{o.label}</span>
                    {ActionIcon && optionAction && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`${optionAction.ariaLabel} ${o.label}`}
                        className={styles.optionActionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          optionAction.onAction(o.value);
                        }}
                      >
                        <ActionIcon size={16} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
Select.displayName = 'Select';
