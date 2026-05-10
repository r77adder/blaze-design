import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Pause02 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.5999 15.6V8.40002M14.3999 15.6V8.40002M11.9999 21.6C6.69797 21.6 2.3999 17.302 2.3999 12C2.3999 6.69809 6.69797 2.40002 11.9999 2.40002C17.3018 2.40002 21.5999 6.69809 21.5999 12C21.5999 17.302 17.3018 21.6 11.9999 21.6Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Pause02
