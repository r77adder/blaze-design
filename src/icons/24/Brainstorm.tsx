import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Brainstorm = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g clipPath="url(#clip0_4895_104410)">
          <g filter="url(#filter0_d_4895_104410)">
            <path
              d="M9.10962 1.82662C9.55654 0.0561779 13.1628 0.617583 13.6323 2.62632L8.63187 12.2838C7.22297 13.953 2.94914 13.4307 3.5874 11.2409C0.601053 11.3443 0.600953 7.1715 3.08843 7.33653C1.07059 6.33693 3.41875 2.99867 4.96123 4.03301C4.02655 1.84798 8.14757 0.473611 9.10962 1.82662Z"
              fill="url(#paint0_radial_4895_104410)"
            />
          </g>
          <path
            d="M7.0065 17.9973L8.58098 10.1822H15.8236L12.5029 16.566H16.3961L8.58098 23.2361L10.27 17.9973H7.0065Z"
            fill="url(#paint1_linear_4895_104410)"
          />
          <g filter="url(#filter1_d_4895_104410)">
            <path
              d="M8.25131 11.8602C6.27928 11.8602 5.50813 8.73361 8.06455 8.11565C7.34271 7.00336 7.86679 5.30431 10.292 5.30431C9.62282 3.78032 11.3467 2.11314 13.5511 2.85823C13.6692 0.758452 18.0913 0.493533 18.094 2.26698C19.5001 0.493533 22.9286 2.85823 21.1169 4.49465C23.7268 4.24895 24.4297 7.85498 21.0537 8.2226C22.2763 10.337 20.4393 13.0134 17.859 11.8095C17.859 14.6825 13.8644 14.2652 12.8581 12.3466C11.32 14.31 7.62027 13.9368 8.25131 11.8602Z"
              fill="url(#paint2_radial_4895_104410)"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_d_4895_104410"
            x="-0.71904"
            y="-0.236053"
            width="16.3514"
            height="16.5045"
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
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4895_104410" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4895_104410" result="shape" />
          </filter>
          <filter
            id="filter1_d_4895_104410"
            x="4.44107"
            y="0.0924377"
            width="20.8953"
            height="16.7828"
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
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4895_104410" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4895_104410" result="shape" />
          </filter>
          <radialGradient
            id="paint0_radial_4895_104410"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(8.53632 12.0378) rotate(-87.2496) scale(11.9473 11.6021)"
          >
            <stop stopColor="#597288" />
            <stop offset="1" stopColor="#C7D8DC" />
          </radialGradient>
          <linearGradient
            id="paint1_linear_4895_104410"
            x1="13.125"
            y1="13.3311"
            x2="13.125"
            y2="22.1482"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF6B00" />
            <stop offset="1" stopColor="#FFC800" />
          </linearGradient>
          <radialGradient
            id="paint2_radial_4895_104410"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(14.8887 13.2681) rotate(-82.7753) scale(11.285 14.8998)"
          >
            <stop stopColor="#95A1AD" />
            <stop offset="1" stopColor="#D4DFDF" />
          </radialGradient>
          <clipPath id="clip0_4895_104410">
            <rect width="24" height="24" fill="white" transform="translate(0.308685)" />
          </clipPath>
        </defs>
      </svg>
    )
  },
)

export default Brainstorm
