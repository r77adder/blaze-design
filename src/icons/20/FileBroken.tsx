import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FileBroken = forwardRef<SVGSVGElement, IconProps>(
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
          d="M6.5 6.5H13.5M6.5 10.5H13.5M4.8 2.5H15.2C15.918 2.5 16.5 3.17157 16.5 4V17.5L14.3333 16L12.1667 17.5L10 16L7.83333 17.5L5.66667 16L3.5 17.5V4C3.5 3.17157 4.08203 2.5 4.8 2.5Z"
          stroke={color}
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default FileBroken
