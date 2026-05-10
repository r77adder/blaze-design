import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AlertTriangle = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 41 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M20.5001 19.8334V12.3575M20.5001 25.3746V25.4403M31.3335 31.6667H9.66684C6.14714 31.6667 4.15591 28.0273 6.22139 24.7081L15.6713 7.66837C17.8853 4.11054 23.115 4.11054 25.329 7.66838L34.7789 24.7081C37.0581 28.3708 34.576 31.6667 31.3335 31.6667Z"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default AlertTriangle
