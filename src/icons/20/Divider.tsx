import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Divider = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path d="M18 10H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 2.25C4.08579 2.25 3.75 2.58579 3.75 3C3.75 3.41421 4.08579 3.75 4.5 3.75H15.5C15.9142 3.75 16.25 3.41421 16.25 3C16.25 2.58579 15.9142 2.25 15.5 2.25H4.5ZM3.75 6C3.75 5.58579 4.08579 5.25 4.5 5.25H15.5C15.9142 5.25 16.25 5.58579 16.25 6C16.25 6.41421 15.9142 6.75 15.5 6.75H4.5C4.08579 6.75 3.75 6.41421 3.75 6ZM4.5 13.25C4.08579 13.25 3.75 13.5858 3.75 14C3.75 14.4142 4.08579 14.75 4.5 14.75H15.5C15.9142 14.75 16.25 14.4142 16.25 14C16.25 13.5858 15.9142 13.25 15.5 13.25H4.5ZM4.5 16.25C4.08579 16.25 3.75 16.5858 3.75 17C3.75 17.4142 4.08579 17.75 4.5 17.75H15.5C15.9142 17.75 16.25 17.4142 16.25 17C16.25 16.5858 15.9142 16.25 15.5 16.25H4.5Z"
        fill={color}
      />
    </svg>
  )
})

export default Divider
