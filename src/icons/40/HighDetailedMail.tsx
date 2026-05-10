import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const HighDetailedMail = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24, ...rest }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
        {...rest}
      >
        <path
          d="M2.625 16.085C2.625 15.5327 3.07272 15.085 3.625 15.085H36.375C36.9273 15.085 37.375 15.5327 37.375 16.085V33.3707C37.375 34.7514 36.2557 35.8707 34.875 35.8707H5.125C3.74429 35.8707 2.625 34.7514 2.625 33.3707V16.085Z"
          fill="#FFBA08"
        />
        <path
          d="M18.2149 4.07434L3.02917 15.3408C2.77491 15.5294 2.625 15.8273 2.625 16.1439V26.4851H37.3594V16.0978C37.3594 15.7808 37.209 15.4825 36.9542 15.2939L21.7868 4.07199C20.7254 3.28669 19.2753 3.28764 18.2149 4.07434Z"
          fill="#FFBA08"
        />
        <path
          d="M3.32708 15.7423L18.5129 4.47589C19.3965 3.82031 20.6049 3.81952 21.4894 4.47394L36.6568 15.6959C36.7842 15.7902 36.8594 15.9393 36.8594 16.0978V25.9851H3.125V16.1439C3.125 15.9856 3.19996 15.8366 3.32708 15.7423Z"
          stroke="#E48900"
          strokeOpacity="0.29"
        />
        <foreignObject x="2.34814" y="6.5" width="35.3035" height="32">
          <div
            style={{
              backdropFilter: 'blur(2px)',
              clipPath: 'url(#bgblur_0_2517_680_clip_path)',
              height: '100%',
              width: '100%',
            }}
          ></div>
        </foreignObject>
        <g filter="url(#filter0_d_2517_680)" data-figma-bg-blur-radius="4">
          <path
            d="M6.34814 11.5C6.34814 10.9477 6.79586 10.5 7.34814 10.5H32.6517C33.204 10.5 33.6517 10.9477 33.6517 11.5V20.8482C33.6517 28.3879 27.5396 34.5 19.9999 34.5V34.5C12.4603 34.5 6.34814 28.3879 6.34814 20.8482V11.5Z"
            fill="white"
            fillOpacity="0.88"
            shapeRendering="crispEdges"
          />
        </g>
        <rect x="10.1484" y="14.4375" width="19.6875" height="19.125" rx="0.5" fill="url(#paint0_linear_2517_680)" />
        <path
          d="M36.1339 34.0086L3.36782 15.8053C3.03456 15.6201 2.625 15.8611 2.625 16.2423V29.0444L3.86607 34.0086L33.6518 35.8703L36.1339 34.0086Z"
          fill="url(#paint1_linear_2517_680)"
        />
        <path
          d="M3.125 34.6562L36.6299 15.8117C36.9632 15.6242 37.375 15.8651 37.375 16.2475V30.2854L33.6518 35.8703H7.58928L3.125 34.6562Z"
          fill="url(#paint2_linear_2517_680)"
        />
        <g style={{ mixBlendMode: 'darken' }}>
          <path
            d="M37.1875 15.4688L33.9375 13.0625L3 33.2188L3.9375 34.375L37.1875 15.4688Z"
            fill="url(#paint3_linear_2517_680)"
            fillOpacity="0.13"
          />
        </g>
        <g style={{ mixBlendMode: 'darken' }}>
          <path
            d="M2.86719 15.4844L6.15625 13.0625L21.1562 24.5L20.1094 25.2188L2.86719 15.4844Z"
            fill="url(#paint4_linear_2517_680)"
            fillOpacity="0.13"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_2517_680"
            x="2.34814"
            y="6.5"
            width="35.3035"
            height="32"
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
            <feOffset />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2517_680" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2517_680" result="shape" />
          </filter>
          <clipPath id="bgblur_0_2517_680_clip_path">
            <path
              transform="translate(-2.34814 -6.5)"
              d="M6.34814 11.5C6.34814 10.9477 6.79586 10.5 7.34814 10.5H32.6517C33.204 10.5 33.6517 10.9477 33.6517 11.5V20.8482C33.6517 28.3879 27.5396 34.5 19.9999 34.5V34.5C12.4603 34.5 6.34814 28.3879 6.34814 20.8482V11.5Z"
            />
          </clipPath>
          <linearGradient
            id="paint0_linear_2517_680"
            x1="29.8359"
            y1="24"
            x2="10.1484"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#BF5CFB" />
            <stop offset="0.495" stopColor="#FF54EE" />
            <stop offset="1" stopColor="#FFCF54" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2517_680"
            x1="19.0169"
            y1="15.3926"
            x2="19.0169"
            y2="35.8703"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FBB500" />
            <stop offset="1" stopColor="#FFBA08" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_2517_680"
            x1="20.6205"
            y1="15.3926"
            x2="20.6205"
            y2="35.8703"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FBB500" />
            <stop offset="1" stopColor="#FFBA08" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_2517_680"
            x1="13.6875"
            y1="27.1563"
            x2="14.5625"
            y2="28.375"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity="0" />
            <stop offset="1" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_2517_680"
            x1="13.4375"
            y1="18.875"
            x2="11.5625"
            y2="21.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopOpacity="0" />
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default HighDetailedMail
