import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const InformationCircleContained = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        data-testid="information-circle-contained-icon"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M10 10L10 13.75M10 7.22046V7.1875M2.5 10C2.5 5.85786 5.85787 2.5 10 2.5C14.1421 2.5 17.5 5.85787 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default InformationCircleContained
