import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Mail = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g id="mail-03">
          <path
            id="Icon"
            d="M4.625 6.81981L11.2686 12.3128C11.9888 12.9081 13.0252 12.9256 13.7649 12.3547L20.9375 6.81981M10.1559 12.636L4.625 18.658M20.375 18.1648L14.8434 12.636M5.75 19.636C4.50736 19.636 3.5 18.576 3.5 17.2683V8.00363C3.5 6.69602 4.50736 5.63599 5.75 5.63599H19.25C20.4926 5.63599 21.5 6.69602 21.5 8.00363V17.2683C21.5 18.576 20.4926 19.636 19.25 19.636H5.75Z"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  },
)

export default Mail
