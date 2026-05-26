/**
 * TextField — iOS text input row.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 5040:17888
 *
 * 402px wide, 52px tall.
 * States: empty | focused | typing | filled
 * Optional bottom separator line.
 */

import { useRef } from 'react';

export type TextFieldState = 'empty' | 'focused' | 'typing' | 'filled';

export interface TextFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  separator?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'search';
}

export function TextField({
  placeholder = 'Placeholder',
  value = '',
  onChange,
  onClear,
  separator = false,
  disabled = false,
  type = 'text',
}: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.length > 0;
  const showClear = hasValue && onClear;

  return (
    <div
      style={{
        width: '100%',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: showClear ? 12 : 20,
        gap: 8,
        boxSizing: 'border-box',
        borderBottom: separator ? '1px solid var(--ios-dark-4)' : undefined,
        background: 'transparent',
        cursor: disabled ? 'default' : 'text',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--ios-font)',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.5,
          color: hasValue ? 'var(--ios-dark-90)' : 'var(--ios-dark-40)',
          caretColor: 'var(--ios-dark-90)',
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
      {showClear && (
        <button
          type="button"
          aria-label="Clear"
          onClick={(e) => {
            e.stopPropagation();
            onClear?.();
          }}
          style={{
            width: 20,
            height: 20,
            borderRadius: 99,
            background: 'var(--ios-dark-25)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
