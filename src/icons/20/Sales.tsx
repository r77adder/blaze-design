import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Sales = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      ref={forwardedRef}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.4 1.31689H15.6C16.3732 1.31689 17 2.07801 17 3.01689V18.3169L14.6667 16.6169L12.3333 18.3169L10 16.6169L7.66667 18.3169L5.33333 16.6169L3 18.3169V3.01689C3 2.07801 3.6268 1.31689 4.4 1.31689ZM6.23107 4.67963C5.81686 4.67963 5.48107 5.01542 5.48107 5.42963C5.48107 5.84385 5.81686 6.17963 6.23107 6.17963H13.7695C14.1837 6.17963 14.5195 5.84385 14.5195 5.42963C14.5195 5.01542 14.1837 4.67963 13.7695 4.67963H6.23107ZM6.23107 8.24995C5.81686 8.24995 5.48107 8.58573 5.48107 8.99995C5.48107 9.41416 5.81686 9.74995 6.23107 9.74995H13.7695C14.1837 9.74995 14.5195 9.41416 14.5195 8.99995C14.5195 8.58573 14.1837 8.24995 13.7695 8.24995H6.23107ZM6.23107 11.7499C5.81686 11.7499 5.48107 12.0857 5.48107 12.4999C5.48107 12.9142 5.81686 13.2499 6.23107 13.2499H13.7695C14.1837 13.2499 14.5195 12.9142 14.5195 12.4999C14.5195 12.0857 14.1837 11.7499 13.7695 11.7499H6.23107Z"
        fill="url(#paint0_linear_2724_38486)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2724_38486"
          x1="10"
          y1="1.31689"
          x2="10"
          y2="18.3169"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#55D536" />
          <stop offset="1" stopColor="#1E9C00" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Sales
