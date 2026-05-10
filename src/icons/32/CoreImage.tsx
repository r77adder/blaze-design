import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CoreImage = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 32 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <g clipPath="url(#clip0_7761_471675)">
        <g filter="url(#filter0_bd_7761_471675)">
          <mask id="path-2-inside-1_7761_471675" fill="white">
            <path d="M4 4.11572H28V28.1157H4V4.11572Z" />
          </mask>
          <path d="M4 4.11572H28V28.1157H4V4.11572Z" fill="white" shapeRendering="crispEdges" />
          <path
            d="M4 4.11572V2.61572C3.17157 2.61572 2.5 3.2873 2.5 4.11572H4ZM28 4.11572H29.5C29.5 3.2873 28.8284 2.61572 28 2.61572V4.11572ZM28 28.1157V29.6157C28.8284 29.6157 29.5 28.9441 29.5 28.1157H28ZM4 28.1157H2.5C2.5 28.9441 3.17157 29.6157 4 29.6157V28.1157ZM4 5.61572H28V2.61572H4V5.61572ZM26.5 4.11572V28.1157H29.5V4.11572H26.5ZM28 26.6157H4V29.6157H28V26.6157ZM5.5 28.1157V4.11572H2.5V28.1157H5.5Z"
            fill="white"
            mask="url(#path-2-inside-1_7761_471675)"
          />
          <path d="M26.7009 5.41504V26.8166H5.29932L26.7009 5.41504Z" fill="url(#paint0_linear_7761_471675)" />
          <path d="M5.29912 26.8164V5.41484H26.7007L5.29912 26.8164Z" fill="url(#paint1_linear_7761_471675)" />
          <g filter="url(#filter1_bdi_7761_471675)">
            <rect
              x="8.7998"
              y="8.80029"
              width="14.4"
              height="14.4"
              rx="7.2"
              fill="black"
              fillOpacity="0.3"
              shapeRendering="crispEdges"
            />
          </g>
          <g filter="url(#filter2_d_7761_471675)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.0002 11.2002C15.3375 11.2002 14.8002 11.7375 14.8002 12.4002V14.8002L12.4002 14.8002C11.7375 14.8002 11.2002 15.3375 11.2002 16.0002C11.2002 16.6629 11.7375 17.2002 12.4002 17.2002H14.8002V19.6002C14.8002 20.2629 15.3375 20.8002 16.0002 20.8002C16.6629 20.8002 17.2002 20.2629 17.2002 19.6002V17.2002H19.6002C20.2629 17.2002 20.8002 16.6629 20.8002 16.0002C20.8002 15.3375 20.2629 14.8002 19.6002 14.8002L17.2002 14.8002V12.4002C17.2002 11.7375 16.6629 11.2002 16.0002 11.2002Z"
              fill="white"
            />
          </g>
        </g>
      </g>
      <defs>
        <filter
          id="filter0_bd_7761_471675"
          x="-1.19231"
          y="-1.07658"
          width="34.3846"
          height="34.3846"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.59615" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_7761_471675" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
          <feBlend mode="normal" in2="effect1_backgroundBlur_7761_471675" result="effect2_dropShadow_7761_471675" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_7761_471675" result="shape" />
        </filter>
        <filter
          id="filter1_bdi_7761_471675"
          x="-3.2002"
          y="-1.19971"
          width="38.3999"
          height="38.3999"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="3.5" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_7761_471675" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_backgroundBlur_7761_471675" result="effect2_dropShadow_7761_471675" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_7761_471675" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.2" dy="0.2" />
          <feGaussianBlur stdDeviation="1.35" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
          <feBlend mode="normal" in2="shape" result="effect3_innerShadow_7761_471675" />
        </filter>
        <filter
          id="filter2_d_7761_471675"
          x="9.2002"
          y="10.2002"
          width="13.6001"
          height="13.6001"
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
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.6 0 0 0 0 0.992157 0 0 0 0.4 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7761_471675" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7761_471675" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_7761_471675"
          x1="16.5351"
          y1="13.4893"
          x2="21.3505"
          y2="27.4976"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#04FF00" />
          <stop offset="1" stopColor="#FFFA6C" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_7761_471675"
          x1="5.29912"
          y1="11.3003"
          x2="17.0213"
          y2="15.0942"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00E1DA" />
          <stop offset="1" stopColor="#2C99FF" />
        </linearGradient>
        <clipPath id="clip0_7761_471675">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
})

export default CoreImage
