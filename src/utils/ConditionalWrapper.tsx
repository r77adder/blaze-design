import { ReactNode } from 'react';

interface Props<T extends ReactNode> {
  condition: string | number | boolean | undefined | null;
  wrapper: (children: T) => ReactNode;
  elseWrapper?: (children: T) => ReactNode;
  children: T;
}

export function ConditionalWrapper<T extends ReactNode>({ condition, wrapper, children, elseWrapper }: Props<T>) {
  if (condition) {
    return <>{wrapper(children)}</>;
  }

  if (elseWrapper) {
    return <>{elseWrapper(children)}</>;
  }

  return <>{children}</>;
}
