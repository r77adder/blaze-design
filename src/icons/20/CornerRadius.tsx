import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CornerRadius = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path d="M18 3H10C6.13401 3 3 6.13401 3 10V17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M11.5001 10.0002C11.5001 10.8286 10.8285 11.5002 10.0001 11.5002C9.17169 11.5002 8.50012 10.8286 8.50012 10.0002C8.50012 9.17177 9.17169 8.5002 10.0001 8.5002C10.8285 8.5002 11.5001 9.17177 11.5001 10.0002Z"
          fill={color}
        />
      </svg>
    )
  },
)

export default CornerRadius
