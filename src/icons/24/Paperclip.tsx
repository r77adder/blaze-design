import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Paperclip = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M9.85714 8.28571V14.2857C9.85714 15.4692 10.8165 16.4286 12 16.4286C13.1835 16.4286 14.1429 15.4692 14.1429 14.2857V8.07143C14.1429 5.82284 12.32 4 10.0714 4C7.82284 4 6 5.82284 6 8.07143V14.7143C6 18.028 8.68629 20.7143 12 20.7143C15.3137 20.7143 18 18.028 18 14.7143V8.28571"
        stroke={color}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Paperclip
