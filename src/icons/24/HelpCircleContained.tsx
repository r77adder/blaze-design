import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const HelpCircleContained = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M12 17.5L11.9987 18M9 9.10376C9 7.3896 10.3431 6 12 6C13.6569 6 15 7.3896 15 9.10376C15 10.8179 13.6569 12.2075 12 12.2075C12 12.2075 11.9987 13.1339 11.9987 14.2767"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default HelpCircleContained
