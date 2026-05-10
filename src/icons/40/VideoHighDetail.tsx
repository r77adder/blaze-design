import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const VideoHighDetail = forwardRef<SVGSVGElement, IconProps>(
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
          d="M2.63749 15.6004C2.94405 11.7558 5.8883 8.73957 9.70549 8.18829C12.8044 7.74074 16.5985 7.325 20 7.325C23.4446 7.325 27.2918 7.75136 30.4121 8.20535C34.1687 8.75193 37.0762 11.6918 37.3693 15.4767C37.4762 16.8567 37.5499 18.3915 37.5499 20C37.5499 21.6346 37.4738 23.193 37.3641 24.5903C37.0697 28.3405 34.2069 31.2638 30.485 31.8093C27.4247 32.2578 23.608 32.675 20 32.675C16.4379 32.675 12.6724 32.2683 9.63229 31.8264C5.84978 31.2766 2.95072 28.2783 2.64301 24.4685C2.52943 23.0622 2.44995 21.5311 2.44995 20C2.44995 18.4938 2.52687 16.9877 2.63749 15.6004Z"
          fill="url(#paint0_linear_7367_7409)"
        />
        <g filter="url(#filter0_di_7367_7409)">
          <path
            d="M27.0414 19.1103C27.766 19.4822 27.766 20.5178 27.0414 20.8897L17.0691 26.0075C16.4036 26.349 15.6125 25.8658 15.6125 25.1178L15.6125 14.8822C15.6125 14.1342 16.4036 13.651 17.0691 13.9925L27.0414 19.1103Z"
            fill="url(#paint1_linear_7367_7409)"
            shapeRendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_di_7367_7409"
            x="7.61255"
            y="9.88087"
            width="27.9723"
            height="28.2383"
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
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="4" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7367_7409" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7367_7409" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.5" dy="0.5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_7367_7409" />
          </filter>
          <linearGradient
            id="paint0_linear_7367_7409"
            x1="20"
            y1="8.3"
            x2="20"
            y2="31.7"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2A7FFF" />
            <stop offset="1" stopColor="#E232FF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_7367_7409"
            x1="22.925"
            y1="25.85"
            x2="31.7"
            y2="19.025"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0.41" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default VideoHighDetail
