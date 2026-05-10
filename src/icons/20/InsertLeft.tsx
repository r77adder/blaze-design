import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const InsertLeft = forwardRef<SVGSVGElement, IconProps>(
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
        <path
          d="M5.88021 12.0175L2.625 15.4354M2.625 15.4354L5.88021 18.8534M2.625 15.4354H17.3125M9.96875 3.34167L9.96875 11.9042M5.6875 7.62293L14.25 7.62292"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default InsertLeft
