import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const HighDetailedVoice = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
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
          d="M0.890154 12.707H23.1097C19.4064 12.707 17.8634 21.8562 13.543 21.8562C9.22249 21.8562 7.98807 12.707 0.890154 12.707Z"
          fill="url(#paint0_linear_18_4)"
        />
        <path
          d="M0.890154 12.7081H23.1097C13.543 12.7081 13.2344 19.8968 8.91388 19.8968C5.82783 19.8968 4.28481 12.7081 0.890154 12.7081Z"
          fill="url(#paint1_linear_18_4)"
        />
        <path
          d="M0.599977 12.7068H23.4C13.5833 12.7068 11.3333 8.05817 6.89998 8.05817C3.73331 8.05817 2.69998 12.7068 0.599977 12.7068Z"
          fill="url(#paint2_linear_18_4)"
        />
        <path
          d="M0.890154 12.7075H23.1097C16.3204 12.7075 15.086 2.25128 11.9999 2.25128C8.91388 2.25128 8.29667 12.7075 0.890154 12.7075Z"
          fill="url(#paint3_linear_18_4)"
          fillOpacity="0.86"
        />
        <path
          d="M23.4 12.7068H0.599954C10.4166 12.7068 12.6666 8.05817 17.1 8.05817C20.2666 8.05817 21.3 12.7068 23.4 12.7068Z"
          fill="url(#paint4_linear_18_4)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_18_4"
            x1="23.1097"
            y1="17.2816"
            x2="0.890154"
            y2="17.2816"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00E182" />
            <stop offset="1" stopColor="#005ECD" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_18_4"
            x1="14.3388"
            y1="16.3025"
            x2="4.39851"
            y2="16.3025"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFD706" stopOpacity="0.84" />
            <stop offset="1" stopColor="#00B212" stopOpacity="0.83" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_18_4"
            x1="8.99998"
            y1="10.3759"
            x2="0.599976"
            y2="10.3759"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF8E09" />
            <stop offset="1" stopColor="#DE0000" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_18_4"
            x1="17.8472"
            y1="3.25788"
            x2="6.04215"
            y2="10.764"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#B900D7" />
            <stop offset="1" stopColor="#FFD704" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_18_4"
            x1="12.3"
            y1="10.3759"
            x2="22.5"
            y2="10.3759"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF8E09" />
            <stop offset="1" stopColor="#0016DE" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default HighDetailedVoice
