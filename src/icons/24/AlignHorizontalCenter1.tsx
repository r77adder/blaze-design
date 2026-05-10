import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AlignHorizontalCenter1 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M2.3999 11.9997L21.5999 11.9997M14.6181 6.39464L11.9999 9.11471M11.9999 9.11471L9.38172 6.39464M11.9999 9.11471V2.40002M9.38172 17.6054L11.9999 14.8853M11.9999 14.8853L14.6181 17.6054M11.9999 14.8853V21.6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default AlignHorizontalCenter1
