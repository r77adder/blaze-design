import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Recent = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M5.49996 16H3.58638C2.48181 16 1.58637 15.1046 1.58638 14L1.58642 6.15868C1.58642 5.39708 1.58614 4.3123 1.5859 3.52684C1.58572 2.97441 2.0335 2.5271 2.58593 2.5271H8.34461L9.99996 4.48846H16.5C17.0522 4.48846 17.5 4.93618 17.5 5.48846V6.5M14.875 14.25L13 13.625V11.0116M18 13C18 15.7614 15.7614 18 13 18C10.2386 18 8 15.7614 8 13C8 10.2386 10.2386 8 13 8C15.7614 8 18 10.2386 18 13Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Recent
