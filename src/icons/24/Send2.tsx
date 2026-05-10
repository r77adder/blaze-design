import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Send2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 25 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M21.6435 13L6.31745 13M5.04047 4.02216L21.1133 11.815C22.1031 12.2949 22.1031 13.705 21.1133 14.1849L5.04047 21.9778C3.93938 22.5117 2.76902 21.3861 3.2595 20.265L6.20704 13.5278C6.35425 13.1913 6.35425 12.8086 6.20704 12.4722L3.2595 5.73492C2.76902 4.61383 3.93938 3.4883 5.04047 4.02216Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Send2
