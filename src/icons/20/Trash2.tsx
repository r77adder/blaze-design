import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Trash2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M3.33333 5.14706H16.6667M8.33333 13.9706V8.67647M11.6667 13.9706V8.67647M13.3333 17.5H6.66667C5.74619 17.5 5 16.7099 5 15.7353V6.02941C5 5.5421 5.3731 5.14706 5.83333 5.14706H14.1667C14.6269 5.14706 15 5.5421 15 6.02941V15.7353C15 16.7099 14.2538 17.5 13.3333 17.5ZM8.33333 5.14706H11.6667C12.1269 5.14706 12.5 4.75202 12.5 4.26471V3.38235C12.5 2.89504 12.1269 2.5 11.6667 2.5H8.33333C7.8731 2.5 7.5 2.89504 7.5 3.38235V4.26471C7.5 4.75202 7.8731 5.14706 8.33333 5.14706Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
    </svg>
  )
})

export default Trash2
