import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Send = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M7 9.8582H8.76337M4 18C2.89543 18 2 17.1046 2 16V4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V16C18 17.1046 17.1046 18 16 18H4ZM7 12.7013V6.88283C7 6.22585 7.69273 5.79965 8.27916 6.09583L13.5158 8.74058C14.1338 9.05271 14.1674 9.92275 13.5753 10.2816L8.33866 13.4553C7.75107 13.8114 7 13.3884 7 12.7013Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Send
