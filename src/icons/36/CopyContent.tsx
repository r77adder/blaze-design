import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const CopyContent = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 36 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g filter="url(#filter0_d_2591_20456)">
          <rect
            x="6.45215"
            y="8.25293"
            width="20.6524"
            height="26.5531"
            rx="1.09272"
            fill="white"
            shapeRendering="auto"
          />
          <path
            d="M8.41919 11.3134C8.41919 10.7099 8.90842 10.2207 9.51191 10.2207H24.0451C24.6486 10.2207 25.1378 10.7099 25.1378 11.3134V18.9625C25.1378 19.566 24.6486 20.0552 24.0451 20.0552H9.51191C8.90842 20.0552 8.41919 19.566 8.41919 18.9625V11.3134Z"
            fill="white"
          />
          <path
            d="M8.41919 11.3134C8.41919 10.7099 8.90842 10.2207 9.51191 10.2207H24.0451C24.6486 10.2207 25.1378 10.7099 25.1378 11.3134V18.9625C25.1378 19.566 24.6486 20.0552 24.0451 20.0552H9.51191C8.90842 20.0552 8.41919 19.566 8.41919 18.9625V11.3134Z"
            fill="url(#paint0_angular_2591_20456)"
            fillOpacity="0.79"
          />
          <rect x="8.41919" y="24.9688" width="16.7186" height="1.34775" rx="0.673873" fill="#58AFFE" />
          <rect x="8.41919" y="27.8535" width="16.7186" height="1.34774" rx="0.673872" fill="#58AFFE" />
          <rect x="8.41919" y="30.7373" width="11.8321" height="1.34774" rx="0.673872" fill="#58AFFE" />
          <rect x="8.41919" y="22.085" width="11.8321" height="1.34774" rx="0.673872" fill="#58AFFE" />
        </g>
        <g filter="url(#filter1_bdi_2591_20456)">
          <rect
            x="12.8955"
            y="3.19434"
            width="20.6524"
            height="26.5531"
            rx="1.09272"
            fill="white"
            fillOpacity="0.67"
            shapeRendering="auto"
          />
          <path
            d="M14.8623 6.25386C14.8623 5.65036 15.3515 5.16113 15.955 5.16113H30.4882C31.0917 5.16113 31.5809 5.65036 31.5809 6.25385V13.9029C31.5809 14.5064 31.0917 14.9956 30.4882 14.9956H15.955C15.3515 14.9956 14.8623 14.5064 14.8623 13.9029V6.25386Z"
            fill="white"
          />
          <path
            d="M14.8623 6.25386C14.8623 5.65036 15.3515 5.16113 15.955 5.16113H30.4882C31.0917 5.16113 31.5809 5.65036 31.5809 6.25385V13.9029C31.5809 14.5064 31.0917 14.9956 30.4882 14.9956H15.955C15.3515 14.9956 14.8623 14.5064 14.8623 13.9029V6.25386Z"
            fill="url(#paint1_angular_2591_20456)"
            fillOpacity="0.79"
          />
          <rect x="14.8623" y="19.9102" width="16.7186" height="1.34775" rx="0.673873" fill="#58AFFE" />
          <rect x="14.8623" y="22.7939" width="16.7186" height="1.34775" rx="0.673873" fill="#58AFFE" />
          <rect x="14.8623" y="25.6787" width="11.8321" height="1.34774" rx="0.673872" fill="#58AFFE" />
          <rect x="14.8623" y="17.0264" width="11.8321" height="1.34774" rx="0.673872" fill="#58AFFE" />
        </g>
        <defs>
          <filter
            id="filter0_d_2591_20456"
            x="0.942148"
            y="2.74293"
            width="31.6723"
            height="37.5727"
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
            <feGaussianBlur stdDeviation="2.755" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.19 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2591_20456" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2591_20456" result="shape" />
          </filter>
          <filter
            id="filter1_bdi_2591_20456"
            x="8.52462"
            y="-1.17655"
            width="29.3941"
            height="35.2945"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.18544" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_2591_20456" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="1.52435" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.13 0" />
            <feBlend mode="normal" in2="effect1_backgroundBlur_2591_20456" result="effect2_dropShadow_2591_20456" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_2591_20456" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.218544" dy="0.218544" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect3_innerShadow_2591_20456" />
          </filter>
          <radialGradient
            id="paint0_angular_2591_20456"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(8.41919 20.0552) rotate(-30.4655) scale(19.3966 17.2106)"
          >
            <stop offset="0.000843082" stopColor="#F56700" />
            <stop offset="0.11057" stopColor="#FBE620" stopOpacity="0.82" />
            <stop offset="0.837209" stopColor="#25FB20" stopOpacity="0.82" />
            <stop offset="1" stopColor="#2B99FE" />
          </radialGradient>
          <radialGradient
            id="paint1_angular_2591_20456"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(14.8623 14.9956) rotate(-30.4655) scale(19.3966 17.2106)"
          >
            <stop offset="0.000843082" stopColor="#F56700" />
            <stop offset="0.11057" stopColor="#FBE620" stopOpacity="0.82" />
            <stop offset="0.837209" stopColor="#25FB20" stopOpacity="0.82" />
            <stop offset="1" stopColor="#2B99FE" />
          </radialGradient>
        </defs>
      </svg>
    )
  },
)

export default CopyContent
