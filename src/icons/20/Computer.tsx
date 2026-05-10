import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Computer = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M11.9999 16.8V19.2M8.3999 20.4H15.5999M4.7999 16.8H19.1999C20.5254 16.8 21.5999 15.7255 21.5999 14.4V5.99998C21.5999 4.67449 20.5254 3.59998 19.1999 3.59998H4.7999C3.47442 3.59998 2.3999 4.67449 2.3999 5.99998V14.4C2.3999 15.7255 3.47442 16.8 4.7999 16.8Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Computer
