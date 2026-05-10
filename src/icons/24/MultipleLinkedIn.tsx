import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const MultipleLinkedIn = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 9.77C5 8.11814 5 7.29221 5.31637 6.65906C5.60675 6.07792 6.07792 5.60675 6.65906 5.31637C7.29221 5 8.11814 5 9.77 5H17.23C18.8819 5 19.7078 5 20.3409 5.31637C20.9221 5.60675 21.3933 6.07792 21.6836 6.65906C22 7.29221 22 8.11814 22 9.77V17.23C22 18.8819 22 19.7078 21.6836 20.3409C21.3933 20.9221 20.9221 21.3933 20.3409 21.6836C19.7078 22 18.8819 22 17.23 22H9.77C8.11814 22 7.29221 22 6.65906 21.6836C6.07792 21.3933 5.60675 20.9221 5.31637 20.3409C5 19.7078 5 18.8819 5 17.23V9.77Z"
          fill="#0A5989"
        />
        <g filter="url(#filter0_d_220_28)">
          <path
            d="M2 6.77C2 5.11814 2 4.29221 2.31637 3.65906C2.60675 3.07792 3.07792 2.60675 3.65906 2.31637C4.29221 2 5.11814 2 6.77 2H14.23C15.8819 2 16.7078 2 17.3409 2.31637C17.9221 2.60675 18.3933 3.07792 18.6836 3.65906C19 4.29221 19 5.11814 19 6.77V14.23C19 15.8819 19 16.7078 18.6836 17.3409C18.3933 17.9221 17.9221 18.3933 17.3409 18.6836C16.7078 19 15.8819 19 14.23 19H6.77C5.11814 19 4.29221 19 3.65906 18.6836C3.07792 18.3933 2.60675 17.9221 2.31637 17.3409C2 16.7078 2 15.8819 2 14.23V6.77Z"
            fill="#1275B1"
          />
        </g>
        <path d="M5.45685 15.9007H7.50828V8.37884H5.45685V15.9007Z" fill="white" />
        <path
          d="M5.2859 6.30553C5.2859 6.97156 5.822 7.51177 6.48256 7.51177C7.14381 7.51177 7.67923 6.97156 7.67923 6.30553C7.67923 5.6395 7.14312 5.09929 6.48256 5.09929C5.822 5.09929 5.2859 5.6395 5.2859 6.30553Z"
          fill="white"
        />
        <path
          d="M13.6626 15.9007H15.714V11.2789C15.714 7.68683 11.8819 7.81743 10.9273 9.58576V8.37884H8.8759V15.9007H10.9273V12.0687C10.9273 9.93998 13.6626 9.76561 13.6626 12.0687V15.9007Z"
          fill="white"
        />
        <defs>
          <filter
            id="filter0_d_220_28"
            x="1"
            y="1"
            width="23"
            height="23"
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
            <feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_220_28" />
            <feOffset dx="2" dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_220_28" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_220_28" result="shape" />
          </filter>
        </defs>
      </svg>
    )
  },
)

export default MultipleLinkedIn
