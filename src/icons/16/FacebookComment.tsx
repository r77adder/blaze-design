import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FacebookComment = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M13.4892 10.4237C13.8169 9.68253 13.9989 8.86252 13.9989 8C13.9989 4.68629 11.3128 2 7.99943 2C4.68604 2 2 4.68629 2 8C2 11.3137 4.68604 14 7.99943 14C9.06621 14 10.068 13.7215 10.936 13.2334L14 13.9994L13.4892 10.4237Z"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default FacebookComment
