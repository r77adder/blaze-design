import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Comment = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M6 6H13M6 10H10M9.73913 13.8261L5.56522 18V13.8261H4C2.89543 13.8261 2 12.9307 2 11.8261V4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V11.8261C18 12.9307 17.1046 13.8261 16 13.8261H9.73913Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Comment
