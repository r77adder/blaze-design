import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Upload5 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 30 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M19.8535 21.5622H21.5625C24.4626 21.5622 26.4844 19.4753 26.4844 16.8747C26.4844 14.771 25.1492 12.728 23.1774 12.2513C23.1101 10.5277 22.345 9.24068 21.2889 8.56183C20.2532 7.89601 18.9742 7.81514 17.8454 8.32376C16.9404 6.57527 15.1567 5.15625 12.8122 5.15625C9.32477 5.15625 6.86685 8.41964 7.04459 11.748C5.02071 12.2883 3.51562 14.2504 3.51562 16.5819C3.51562 19.3291 5.6 21.5622 8.16402 21.5622H10.0781"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 13.3594V24.8438M15 13.3594L10.8984 17.4609M15 13.3594L19.1016 17.4609"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Upload5
