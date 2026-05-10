import {
  ForwardRefExoticComponent,
  FunctionComponent,
  PropsWithChildren,
  RefAttributes,
  SVGAttributes,
  SVGProps,
} from 'react'

export interface IconProps extends SVGAttributes<SVGElement> {
  children?: never
  color?: string
  size?: number
}

export interface IconSizeProps {
  size?: number
}

// Extend the original prop definitions to include the size prop
export type Icon =
  | FunctionComponent<PropsWithChildren<SVGProps<SVGSVGElement> & IconSizeProps>>
  | ForwardRefExoticComponent<RefAttributes<SVGSVGElement> & IconSizeProps>
