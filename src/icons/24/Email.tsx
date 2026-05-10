import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Email = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24, strokeWidth = 1.75 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5.1875 6.75L11.8596 11.5403C12.2449 11.8168 12.7551 11.8168 13.1404 11.5403L19.8125 6.75M5.75 19H19.25C20.4926 19 21.5 17.9553 21.5 16.6667V7.33333C21.5 6.04467 20.4926 5 19.25 5H5.75C4.50736 5 3.5 6.04467 3.5 7.33333V16.6667C3.5 17.9553 4.50736 19 5.75 19Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default Email
