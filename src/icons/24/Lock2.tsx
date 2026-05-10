import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Lock2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
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
        d="M6.60005 8.79999V7.88571C6.60005 4.8468 9.00862 2.39999 12 2.39999C14.9915 2.39999 17.4001 4.8468 17.4001 7.88571V8.79999M6.60005 8.79999C5.61005 8.79999 4.80005 9.62285 4.80005 10.6286V19.7714C4.80005 20.7771 5.61005 21.6 6.60005 21.6H17.4001C18.3901 21.6 19.2001 20.7771 19.2001 19.7714V10.6286C19.2001 9.62285 18.3901 8.79999 17.4001 8.79999M6.60005 8.79999H17.4001M12 16.2V13.8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Lock2
