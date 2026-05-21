import { createContext, forwardRef, useContext, type MouseEvent } from 'react';
import type { TabsContextValue, TabsRootProps, TabsTabProps } from './Types';
import styles from './Tabs.module.scss';

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs.Tab must be rendered inside Tabs.Root');
  }
  return ctx;
}

const Root = forwardRef<HTMLDivElement, TabsRootProps>(
  ({ value, onChange, children, className, variant: _variant = 'underline', ...rest }, ref) => {
    const classes = [styles.root, className].filter(Boolean).join(' ');
    return (
      <TabsContext.Provider value={{ value, onChange }}>
        <div ref={ref} className={classes} role="tablist" {...rest}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
Root.displayName = 'Tabs.Root';

const Tab = forwardRef<HTMLButtonElement, TabsTabProps>(
  ({ value: tabValue, children, className, onClick, type = 'button', ...rest }, ref) => {
    const { value, onChange } = useTabs();
    const selected = value === tabValue;
    const classes = [styles.tab, selected ? styles.selected : null, className].filter(Boolean).join(' ');

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onChange(tabValue);
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type={type}
        role="tab"
        aria-selected={selected}
        tabIndex={selected ? 0 : -1}
        className={classes}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
Tab.displayName = 'Tabs.Tab';

/**
 * Underline-style tab strip.
 *
 * Use for tabs that switch the content of an adjacent panel (sidebar tabs,
 * analytics views). For filter-style chips that flag selected state without
 * switching content, use `TabChip` instead.
 *
 * @example
 *   <Tabs.Root value={panel} onChange={setPanel}>
 *     <Tabs.Tab value="actions">Actions</Tabs.Tab>
 *     <Tabs.Tab value="metadata">Metadata</Tabs.Tab>
 *   </Tabs.Root>
 */
export const Tabs = {
  Root,
  Tab,
};
