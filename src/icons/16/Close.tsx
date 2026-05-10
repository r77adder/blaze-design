import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Close = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.40354 3.69625C4.20828 3.50099 3.8917 3.50099 3.69643 3.69625C3.50117 3.89151 3.50117 4.2081 3.69643 4.40336L7.29509 8.00201L3.69649 11.6006C3.50123 11.7959 3.50123 12.1125 3.69649 12.3077C3.89175 12.503 4.20833 12.503 4.40359 12.3077L8.00219 8.70912L11.6008 12.3077C11.7961 12.503 12.1126 12.503 12.3079 12.3077C12.5032 12.1125 12.5032 11.7959 12.3079 11.6006L8.7093 8.00201L12.308 4.40336C12.5032 4.2081 12.5032 3.89151 12.308 3.69625C12.1127 3.50099 11.7961 3.50099 11.6008 3.69625L8.00219 7.2949L4.40354 3.69625Z"
        fill={color}
      />
    </svg>
  )
})

export default Close
