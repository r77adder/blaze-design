import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Heart = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M3.08463 4.97927C3.84156 4.20401 4.86804 3.7685 5.93834 3.7685C7.00864 3.7685 8.03512 4.20401 8.79205 4.97927L9.97471 6.18989L11.1574 4.97927C11.5297 4.5843 11.9751 4.26926 12.4676 4.05253C12.96 3.8358 13.4897 3.72172 14.0256 3.71695C14.5616 3.71218 15.0931 3.81681 15.5891 4.02474C16.0852 4.23267 16.5358 4.53973 16.9148 4.92801C17.2938 5.31629 17.5935 5.77801 17.7965 6.28623C17.9994 6.79445 18.1016 7.33899 18.0969 7.88808C18.0922 8.43717 17.9809 8.97981 17.7693 9.48434C17.5578 9.98887 17.2503 10.4452 16.8648 10.8267L9.97471 17.8867L3.08463 10.8267C2.32792 10.0512 1.90283 8.99951 1.90283 7.90296C1.90283 6.80642 2.32792 5.75476 3.08463 4.97927Z"
        fill="url(#paint0_linear_2721_29269)"
        stroke="#EC1E28"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2721_29269"
          x1="9.99994"
          y1="3.7168"
          x2="9.99994"
          y2="17.8867"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC1E28" />
          <stop offset="1" stopColor="#AD0008" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Heart
