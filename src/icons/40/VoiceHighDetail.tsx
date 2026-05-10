import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const VoiceHighDetail = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 40 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M1.48364 21.1783H38.5162C32.3441 21.1783 29.7724 36.427 22.5716 36.427C15.3709 36.427 13.3135 21.1783 1.48364 21.1783Z"
          fill="url(#paint0_linear_7368_7413)"
        />
        <path
          d="M1.48364 21.1802H38.5162C22.5716 21.1802 22.0573 33.1614 14.8565 33.1614C9.71311 33.1614 7.1414 21.1802 1.48364 21.1802Z"
          fill="url(#paint1_linear_7368_7413)"
        />
        <path
          d="M0.999962 21.178H39C22.6389 21.178 18.8889 13.4303 11.5 13.4303C6.22219 13.4303 4.49997 21.178 0.999962 21.178Z"
          fill="url(#paint2_linear_7368_7413)"
        />
        <path
          d="M1.48364 21.1792H38.5162C27.2007 21.1792 25.1434 3.75213 19.9999 3.75213C14.8565 3.75213 13.8278 21.1792 1.48364 21.1792Z"
          fill="url(#paint3_linear_7368_7413)"
          fillOpacity="0.86"
        />
        <path
          d="M39 21.178H1C17.3611 21.178 21.1111 13.4303 28.5 13.4303C33.7778 13.4303 35.5 21.178 39 21.178Z"
          fill="url(#paint4_linear_7368_7413)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_7368_7413"
            x1="38.5162"
            y1="28.8026"
            x2="1.48364"
            y2="28.8026"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00E182" />
            <stop offset="1" stopColor="#005ECD" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_7368_7413"
            x1="23.8981"
            y1="27.1708"
            x2="7.3309"
            y2="27.1708"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFD706" stopOpacity="0.84" />
            <stop offset="1" stopColor="#00B212" stopOpacity="0.83" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_7368_7413"
            x1="15"
            y1="17.2931"
            x2="0.99996"
            y2="17.2931"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF8E09" />
            <stop offset="1" stopColor="#DE0000" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_7368_7413"
            x1="29.7454"
            y1="5.42979"
            x2="10.0703"
            y2="17.94"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#B900D7" />
            <stop offset="1" stopColor="#FFD704" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_7368_7413"
            x1="20.5"
            y1="17.2931"
            x2="37.5"
            y2="17.2931"
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

export default VoiceHighDetail
