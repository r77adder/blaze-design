import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LetterSpacing3 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M2 5.87831L4.87831 3M4.87831 3L7.75661 5.87831M4.87831 3V16.4321M2 13.5538L4.87831 16.4321M4.87831 16.4321L7.75661 13.5538M11.9048 14.5132H14.4444M14.4444 14.5132H16.9841M14.4444 14.5132V5.87831M14.4444 5.87831H10.6349V7.40212M14.4444 5.87831H18V7.65609"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default LetterSpacing3
