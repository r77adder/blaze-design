import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const MultipleFacebook = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ height: size, width: size }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_220_67)">
          <path
            d="M3.35825 13.4097C3.35825 7.96572 7.77144 3.55253 13.2154 3.55253V3.55253C18.6593 3.55253 23.0725 7.96572 23.0725 13.4097V13.4097C23.0725 18.8536 18.6593 23.2668 13.2154 23.2668V23.2668C7.77144 23.2668 3.35825 18.8536 3.35825 13.4097V13.4097Z"
            fill="#0E56B3"
          />
          <g filter="url(#filter0_d_220_67)">
            <path
              d="M0.927464 10.5903C0.927464 5.14638 5.34066 0.73319 10.7846 0.73319V0.73319C16.2286 0.73319 20.6418 5.14638 20.6418 10.5903V10.5903C20.6418 16.0343 16.2286 20.4475 10.7846 20.4475V20.4475C5.34066 20.4475 0.927464 16.0343 0.927464 10.5903V10.5903Z"
              fill="#1877F2"
            />
          </g>
          <path
            d="M20.6417 10.5895C20.6415 8.70571 20.1014 6.86141 19.0856 5.27498C18.0698 3.68855 16.6207 2.42643 14.9099 1.63803C13.1991 0.84963 11.2983 0.567968 9.43241 0.82639C7.56654 1.08481 5.81377 1.8725 4.38162 3.09619C2.94946 4.31988 1.89789 5.92834 1.35141 7.73115C0.804919 9.53396 0.786396 11.4556 1.29803 13.2686C1.80966 15.0816 2.83003 16.7101 4.23833 17.9611C5.64662 19.2122 7.38388 20.0336 9.24443 20.3279V13.4397H6.74195V10.5895H9.24443V8.41834C9.24443 5.94647 10.7156 4.58238 12.968 4.58238C14.0461 4.58238 15.1735 4.77461 15.1735 4.77461V7.20089H13.9315C12.7067 7.20089 12.3248 7.96118 12.3248 8.74118V10.5895H15.0589L14.6215 13.4397H12.3248V20.3279C14.6433 19.9606 16.7548 18.778 18.2794 16.9929C19.8039 15.2077 20.6416 12.9372 20.6417 10.5895Z"
            fill="#1877F2"
          />
          <path
            d="M15.0587 10.5897H12.3246V8.7413C12.3246 7.96129 12.7066 7.201 13.9313 7.201H15.1733V4.77473C15.1733 4.77473 14.0459 4.5825 12.9678 4.5825C10.7154 4.5825 9.24425 5.94782 9.24425 8.41845V10.5897H6.74177V13.4398H9.24425V20.328C9.75377 20.4078 10.2687 20.4478 10.7844 20.4475C11.3002 20.4478 11.8151 20.4078 12.3246 20.328V13.4398H14.6213"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_220_67"
            x="-0.0725355"
            y="-0.26681"
            width="25.7143"
            height="25.7143"
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
            <feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_220_67" />
            <feOffset dx="2" dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_220_67" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_220_67" result="shape" />
          </filter>
          <clipPath id="clip0_220_67">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    )
  },
)

export default MultipleFacebook
