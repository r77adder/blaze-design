import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Favourite = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 5C5 3.89543 5.89543 3 7 3H16C17.1046 3 18 3.89543 18 5V19.8829C18 20.3149 17.4891 20.5436 17.1669 20.2558L11.5 15.1936L5.8331 20.2558C5.51092 20.5436 5 20.3149 5 19.8829V5Z"
        stroke={color}
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Favourite
