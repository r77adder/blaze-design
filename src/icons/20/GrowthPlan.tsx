import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const GrowthPlan = forwardRef<SVGSVGElement, IconProps>(
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
          d="M17.8134 18.5V10.2912C17.8134 9.93655 17.6246 9.61076 17.3278 9.41664C14.9365 7.8525 11.337 4.45057 10.1464 1.54031C10.0674 1.3472 9.72495 1.35191 9.65118 1.54707C8.55261 4.45374 5.1424 7.79827 2.67078 9.41718C2.37498 9.61093 2.1875 9.93569 2.1875 10.2893V18.5"
          stroke="url(#paint0_linear_9908_74324)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M2.1875 12.75C4.51639 11.3752 8.07159 8.9376 9.72626 6.38629C9.8098 6.25749 10.0028 6.25833 10.0855 6.38766C11.6673 8.86087 15.3157 11.4153 17.8134 12.75"
          stroke="url(#paint1_linear_9908_74324)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M2.1875 15.685C4.99074 14.2887 7.59763 12.9031 9.76357 10.505C9.84159 10.4187 9.97655 10.4147 10.059 10.4969C12.3695 12.8005 15.404 14.56 17.8134 15.685"
          stroke="url(#paint2_linear_9908_74324)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M2.1875 18.5C4.89389 17.5162 7.17195 16.3826 9.76035 14.2321C9.83451 14.1705 9.94274 14.1698 10.0176 14.2305C12.529 16.2692 15.1098 17.5169 17.8134 18.5"
          stroke="url(#paint3_linear_9908_74324)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="paint0_linear_9908_74324"
            x1="17.6351"
            y1="1.65257"
            x2="1.70628"
            y2="2.18747"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#65CEFE" />
            <stop offset="1" stopColor="#0C7DFF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_9908_74324"
            x1="17.6351"
            y1="6.42238"
            x2="1.81478"
            y2="7.83685"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#65CEFE" />
            <stop offset="1" stopColor="#0C7DFF" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_9908_74324"
            x1="17.6351"
            y1="10.6075"
            x2="1.88386"
            y2="12.3625"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#65CEFE" />
            <stop offset="1" stopColor="#0C7DFF" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_9908_74324"
            x1="17.6351"
            y1="14.341"
            x2="1.97803"
            y2="16.4708"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#65CEFE" />
            <stop offset="1" stopColor="#0C7DFF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default GrowthPlan
