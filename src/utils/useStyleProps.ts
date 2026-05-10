import { CSSProperties } from 'react';
import { StyleProps } from './StyleProps';

const supportedStyles = ['justifyContent', 'color'];

export function useStyleProps<T extends StyleProps>(props: T) {
  let styleProps: CSSProperties = {};

  for (const prop in props) {
    if (supportedStyles.includes(prop)) {
      styleProps = {
        ...styleProps,
        [prop]: props[prop],
      };
    }
  }

  return { styleProps };
}
