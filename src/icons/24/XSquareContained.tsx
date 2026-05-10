import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const XSquareContained = forwardRef<SVGSVGElement, IconProps>(
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
          d="M15.182 8.81799L12 11.9999M12 11.9999L8.81802 15.1819M12 11.9999L15.182 15.1819M12 11.9999L8.81802 8.81799M21 6.37498L21 17.625C21 19.489 19.489 21 17.625 21H6.375C4.51104 21 3 19.489 3 17.625V6.37498C3 4.51103 4.51104 3 6.375 3H17.625C19.489 3 21 4.51103 21 6.37498Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  },
)

export default XSquareContained
