import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const BellInactive = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M16.5836 15.1027C16.1105 14.4588 15.6509 13.5095 15.6509 12.3648V8.3333C15.6509 5.22748 13.1117 2.70972 9.97941 2.70972C9.29998 2.70972 8.64887 2.82992 8.04653 3.05005M7.33308 15.8662C7.33308 17.2288 8.52699 18.3333 9.99975 18.3333C11.4725 18.3333 12.6664 17.2288 12.6664 15.8662L3.75611 15.8662C3.40477 15.8662 3.20853 15.3669 3.42106 15.0895C3.91422 14.4458 4.39021 13.5017 4.39021 12.3648L4.39021 8.25167C4.39021 7.00426 4.80585 5.85311 5.5073 4.92694M15.6511 18.3333L3.30779 1.39204"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default BellInactive
