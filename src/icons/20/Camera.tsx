import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Camera = forwardRef<SVGSVGElement, IconProps>(({ size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <g clipPath="url(#clip0_93_36)">
        <rect x="2.97311" y="4.56473" width="2.04921" height="0.972726" fill="#070707" />
        <g filter="url(#filter0_d_93_36)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.6669 4.0054C13.4111 3.36582 12.7916 2.94643 12.1028 2.94643H7.89715C7.2083 2.94643 6.58885 3.36582 6.33302 4.0054V4.0054C6.07719 4.64498 5.45773 5.06437 4.76888 5.06437H3.39286C2.01215 5.06437 0.892857 6.18366 0.892857 7.56437V14.6427C0.892857 16.0234 2.01215 17.1427 3.39286 17.1427H16.6071C17.9879 17.1427 19.1071 16.0234 19.1071 14.6427V7.56437C19.1071 6.18366 17.9879 5.06437 16.6071 5.06437H15.231C14.5422 5.06437 13.9227 4.64498 13.6669 4.0054V4.0054Z"
            fill="url(#paint0_linear_93_36)"
          />
        </g>
        <circle cx="10.6425" cy="11.0193" r="5.48186" fill="url(#paint1_linear_93_36)" />
        <circle cx="9.9793" cy="10.4031" r="5.33618" fill="url(#paint2_linear_93_36)" />
        <ellipse cx="15.6914" cy="6.76496" rx="0.668073" ry="0.668073" fill="#EFCB00" />
        <circle cx="9.97936" cy="10.3843" r="4.65814" fill="url(#paint3_linear_93_36)" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.41708 12.2335C6.33091 11.8899 6.28516 11.5302 6.28516 11.1598C6.28516 8.72935 8.25545 6.75906 10.6859 6.75906C11.2293 6.75906 11.7496 6.85753 12.2301 7.03759C11.5653 6.53761 10.7387 6.24128 9.84294 6.24128C7.6476 6.24128 5.86792 8.02096 5.86792 10.2163C5.86792 10.9526 6.06813 11.6422 6.41708 12.2335Z"
          fill="url(#paint4_linear_93_36)"
        />
        <rect x="2.97311" y="4.33036" width="2.04921" height="0.535714" rx="0.267857" fill="#525252" />
      </g>
      <defs>
        <filter
          id="filter0_d_93_36"
          x="-1.10714"
          y="1.94643"
          width="22.2143"
          height="18.1963"
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
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_93_36" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_93_36" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_93_36"
          x1="10"
          y1="2.94643"
          x2="10"
          y2="16.5012"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5C5C5C" />
          <stop offset="1" stopColor="#1B1B1B" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_93_36"
          x1="10.6425"
          y1="5.53746"
          x2="10.6425"
          y2="16.5012"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_93_36"
          x1="6.78563"
          y1="6.25"
          x2="13.3928"
          y2="14.4643"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#141414" />
          <stop offset="1" stopColor="#686868" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_93_36"
          x1="9.97936"
          y1="5.72614"
          x2="9.97936"
          y2="15.0424"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#3F3F3F" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_93_36"
          x1="9.72061"
          y1="5.55769"
          x2="9.84292"
          y2="12.2335"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A6A4A4" />
          <stop offset="1" stopColor="#A6A4A4" stopOpacity="0" />
        </linearGradient>
        <clipPath id="clip0_93_36">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
})

export default Camera
