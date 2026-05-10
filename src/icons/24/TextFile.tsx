import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TextFile = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M19.6 18.0004V19.2004C19.6 20.5259 18.5255 21.6004 17.2 21.6004L6.39999 21.6003C5.0745 21.6003 3.99999 20.5258 4 19.2003L4.00009 4.80038C4.0001 3.4749 5.07462 2.40039 6.40009 2.40039H17.2003C18.5258 2.40039 19.6003 3.47493 19.6003 4.80044V8.80039"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.798 11.1942H10.0424V15.7998H9.06955V11.1942H7.31395V10.343H11.798V11.1942ZM17.02 10.343L15.1884 13.0258L17.096 15.7998H16.0016L14.6108 13.7478L13.2124 15.7998H12.1484L14.056 13.0258L12.2168 10.343H13.3112L14.6336 12.2962L15.956 10.343H17.02ZM21.9285 11.1942H20.1729V15.7998H19.2001V11.1942H17.4445V10.343H21.9285V11.1942Z"
        fill={color}
      />
    </svg>
  )
})

export default TextFile
