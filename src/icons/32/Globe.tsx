import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Globe = forwardRef<SVGSVGElement, IconProps>(({ size = 32 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <g filter="url(#filter0_d_2383_1101)">
        <circle cx="17" cy="16" r="12.2775" fill="url(#paint0_radial_2383_1101)" />
      </g>
      <mask
        id="mask0_2383_1101"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="4"
        y="3"
        width="26"
        height="26"
      >
        <circle cx="17" cy="15.9904" r="12.2725" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_2383_1101)">
        <path
          opacity="0.3"
          d="M6.26172 22.8218C8.59333 24.157 12.4671 25.0305 16.8518 25.0305C21.4279 25.0305 25.4477 24.079 27.7385 22.6442M6.26172 9.81413C8.59333 11.1493 12.4671 12.0229 16.8518 12.0229C21.4279 12.0229 25.4477 11.0713 27.7385 9.63655M16.8518 28.727C13.7766 28.727 11.2837 23.0289 11.2837 16C11.2837 8.97112 13.7766 3.27307 16.8518 3.27307C19.9269 3.27307 22.4198 8.97112 22.4198 16C22.4198 23.0289 19.9269 28.727 16.8518 28.727Z"
          stroke="white"
          strokeWidth="0.5"
        />
        <path
          opacity="0.3"
          d="M3.19263 15.5801C6.19064 17.8125 11.1716 19.273 16.8094 19.273C22.6935 19.273 27.8621 17.6821 30.8076 15.2832"
          stroke="white"
          strokeWidth="0.5"
        />
      </g>
      <g filter="url(#filter1_d_2383_1101)">
        <path
          d="M22.3722 23.37L22.3933 11.6328L10.5667 12.1471L13.784 15.2056C10.086 19.7792 6.70229 23.37 5.2493 19.7792C4.17715 23.3698 6.65799 25.1113 8.21741 25.5357C12.7441 26.7678 17.2487 22.1424 19.4209 20.5643L22.3722 23.37Z"
          fill="url(#paint1_linear_2383_1101)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_2383_1101"
          x="0.722412"
          y="3.72247"
          width="32.5551"
          height="32.5551"
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
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2383_1101" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2383_1101" result="shape" />
        </filter>
        <filter
          id="filter1_d_2383_1101"
          x="2.98853"
          y="10.6328"
          width="21.4048"
          height="18.1091"
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
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2383_1101" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2383_1101" result="shape" />
        </filter>
        <radialGradient
          id="paint0_radial_2383_1101"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(14.2744 10.8549) rotate(37.8482) scale(17.3458 18.4908)"
        >
          <stop stopColor="#0080DC" />
          <stop offset="0.791771" stopColor="#002687" />
          <stop offset="1" stopColor="#0059AB" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_2383_1101"
          x1="11.2076"
          y1="28.295"
          x2="22.2069"
          y2="12.3037"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#07A9EE" />
          <stop offset="0.55881" stopColor="#FFC700" />
          <stop offset="1" stopColor="#FFEEB2" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Globe
