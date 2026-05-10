import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TurnMeetingVideosIntoContent = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 24 24`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M2.30869 5C2.30869 3.34315 3.65183 2 5.30869 2H19.3087C20.9655 2 22.3087 3.34315 22.3087 5V19C22.3087 20.6569 20.9655 22 19.3087 22H5.30869C3.65183 22 2.30869 20.6569 2.30869 19V5Z"
          fill="url(#paint0_linear_4895_103916)"
        />
        <g filter="url(#filter0_d_4895_103916)">
          <path
            d="M16.44 12.6154C17.105 12.2302 17.105 11.27 16.44 10.8848L10.421 7.39808C9.75436 7.01188 8.91977 7.49293 8.91977 8.26338V15.2368C8.91977 16.0073 9.75436 16.4883 10.421 16.1021L16.44 12.6154Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_4895_103916"
            x="6.91977"
            y="7.26188"
            width="12.0189"
            height="12.9764"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4895_103916" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4895_103916" result="shape" />
          </filter>
          <linearGradient
            id="paint0_linear_4895_103916"
            x1="12.3087"
            y1="2"
            x2="12.3087"
            y2="22"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0040E3" />
            <stop offset="1" stopColor="#002585" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default TurnMeetingVideosIntoContent
