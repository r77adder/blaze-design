import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const MediaStrip = forwardRef<SVGSVGElement, IconProps>(
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
          d="M6 17.5V2.5M14 17.5V2.5M2 10H18M2 6H6M14 6H18M2 14H6M14 14H18M2 15.0001L2 5C2 3.34315 3.34315 2 5 2L15 2C16.6569 2 18 3.34315 18 5V15.0001C18 16.6569 16.6569 18.0001 15 18.0001H5C3.34315 18.0001 2 16.6569 2 15.0001Z"
          stroke={color}
        />
      </svg>
    )
  },
)

export default MediaStrip
