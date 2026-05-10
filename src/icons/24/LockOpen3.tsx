import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LockOpen3 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
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
        d="M16.2361 6.06884C16.0002 4.0625 14.5501 1.95836 11.5816 2.32838C8.61317 2.69841 7.56264 5.03125 7.86344 7.11253L8.29449 10.5697M6.60005 10.8C5.61005 10.8 4.80005 11.6229 4.80005 12.6286V19.7714C4.80005 20.7771 5.61005 21.6 6.60005 21.6H17.4001C18.3901 21.6 19.2001 20.7771 19.2001 19.7714V12.6286C19.2001 11.6229 18.3901 10.8 17.4001 10.8H6.60005Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default LockOpen3
