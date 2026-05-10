import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CheckboxChecked = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 36 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <rect width="36" height="36" rx="2" fill={color} />
        <path
          d="M9 18.9265C10.7838 20.1618 14.3514 23.5588 15.8108 25.875C17.5946 22.1691 22.1351 13.8309 27 10.125"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CheckboxChecked
