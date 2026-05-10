import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const UpgradeStar = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M8.87891 1.63867C9.30886 0.767931 10.5004 0.713582 11.0254 1.47559L11.1211 1.63867L12.9961 5.43848L17.1895 6.04785C18.2146 6.19695 18.6235 7.45655 17.8818 8.17969L14.8467 11.1377L15.5645 15.3135C15.7396 16.3346 14.667 17.1139 13.75 16.6318L10 14.6592L6.25 16.6318C5.33296 17.114 4.26041 16.3346 4.43555 15.3135L5.15234 11.1377L2.11816 8.17969C1.37645 7.45654 1.78546 6.19695 2.81055 6.04785L7.00293 5.43848L8.87891 1.63867Z"
          fill="url(#paint0_linear_6001_502)"
          stroke="url(#paint1_linear_6001_502)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient
            id="paint0_linear_6001_502"
            x1="10"
            y1="1.0625"
            x2="10"
            y2="18.0625"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9500FF" />
            <stop offset="1" stopColor="#6A00FF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_6001_502"
            x1="10"
            y1="1.0625"
            x2="10"
            y2="18.0625"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9500FF" />
            <stop offset="1" stopColor="#6A00FF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default UpgradeStar
