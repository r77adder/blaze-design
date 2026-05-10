import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const SendBox = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M7.5 9.8582H9.26337M4.5 18C3.39543 18 2.5 17.1046 2.5 16V4C2.5 2.89543 3.39543 2 4.5 2H16.5C17.6046 2 18.5 2.89543 18.5 4V16C18.5 17.1046 17.6046 18 16.5 18H4.5ZM7.5 12.7013V6.88283C7.5 6.22585 8.19273 5.79965 8.77916 6.09583L14.0158 8.74058C14.6338 9.05271 14.6674 9.92275 14.0753 10.2816L8.83866 13.4553C8.25107 13.8114 7.5 13.3884 7.5 12.7013Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default SendBox
