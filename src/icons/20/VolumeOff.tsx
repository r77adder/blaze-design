import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const VolumeOff = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, fill = 'none' }, forwardedRef) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        ref={forwardedRef}
      >
        <path
          d="M17.1957 8.0625V3L11.1408 8.23261L5 8.23261V15.7667H9.33483M17.1957 13.125V21L11.9643 16.632M5.53571 19.3125L9.33483 15.7667M20 5.8125L9.33483 15.7667"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default VolumeOff
