import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Lock3 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M6.60005 10.1714C5.61005 10.1714 4.80005 10.9943 4.80005 12V19.7714C4.80005 20.7771 5.61005 21.6 6.60005 21.6H17.4001C18.3901 21.6 19.2001 20.7771 19.2001 19.7714V12C19.2001 10.9943 18.3901 10.1714 17.4001 10.1714M6.60005 10.1714H17.4001M6.60005 10.1714H7.71875V7.49997C7.71875 4.46106 9.00862 2.39999 12 2.39999C14.9915 2.39999 16.1562 4.46106 16.1562 7.49997V10.1714H17.4001M12 17.1375V14.7375"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Lock3
