import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Bag04 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M18.1998 9.79998V6.29998C18.1998 3.98038 16.3194 2.09998 13.9998 2.09998C11.6802 2.09998 9.7998 3.98038 9.7998 6.29998V9.79997M5.51496 25.9H22.4847C23.9842 25.9 25.1998 24.707 25.1998 23.2353L23.4604 9.09994C23.4604 7.62827 22.2448 6.43525 20.7453 6.43525H6.91496C5.41542 6.43525 4.1998 7.62827 4.1998 9.09994L2.7998 23.2353C2.7998 24.707 4.01542 25.9 5.51496 25.9Z"
        stroke={color}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Bag04
