import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Share = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M17.5001 9.54918L9.50008 4.25L9.50008 7.25C2.49992 8.75 2.49992 15.75 2.49992 15.75C2.49992 15.75 5.49992 11.75 9.50008 12.25L9.50008 15.35L17.5001 9.54918Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Share
