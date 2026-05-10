import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CheckSquareBroken = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        data-testid={'chevron-right-icon'}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M11.875 2.5H5.3125C3.7592 2.5 2.5 3.75919 2.5 5.31248V14.6875C2.5 16.2408 3.7592 17.5 5.3125 17.5H14.6875C16.2408 17.5 17.5 16.2408 17.5 14.6875V9.53121M16.5625 4.84374L10 11.4062L8.125 9.53121"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CheckSquareBroken
