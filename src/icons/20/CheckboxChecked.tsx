import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CheckboxChecked = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <rect x="0.859375" width="20" height="20" rx="4" fill="var(--selected-fill)" />
        <path
          d="M5.85938 10.5147C6.85037 11.201 8.83235 13.0882 9.64316 14.375C10.6341 12.3162 13.1567 7.68382 15.8594 5.625"
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
