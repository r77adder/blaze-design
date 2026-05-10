import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Save2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        id="Icon"
        d="M6.448 17.1885V12.9697C6.448 12.452 6.86773 12.0322 7.3855 12.0322H13.948C14.4658 12.0322 14.8855 12.452 14.8855 12.9697V17.6572M14.8855 4.06348V5.93848C14.8855 6.45624 14.4658 6.87598 13.948 6.87598L7.3855 6.87598C6.86773 6.87598 6.448 6.45624 6.448 5.93848L6.448 3.12598M17.696 6.40525L14.8875 3.5967C14.5861 3.2953 14.1773 3.12598 13.7511 3.12598H4.77389C3.88628 3.12598 3.16675 3.84551 3.16675 4.73312V16.5188C3.16675 17.4064 3.88628 18.126 4.77389 18.126H16.5596C17.4472 18.126 18.1667 17.4064 18.1667 16.5188V7.54167C18.1667 7.11543 17.9974 6.70665 17.696 6.40525Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Save2
