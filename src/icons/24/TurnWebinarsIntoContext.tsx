import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TurnWebinarsIntoContent = forwardRef<SVGSVGElement, IconProps>(
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
          d="M16.9351 10C16.9351 9.44772 17.3828 9 17.9351 9H21.9351C22.4873 9 22.9351 9.44772 22.9351 10V14C22.9351 14.5523 22.4873 15 21.9351 15H17.9351C17.3828 15 16.9351 14.5523 16.9351 14V10Z"
          fill="#FF6B00"
        />
        <path
          d="M16.9351 2C16.9351 1.44772 17.3828 1 17.9351 1H21.9351C22.4873 1 22.9351 1.44772 22.9351 2V6C22.9351 6.55228 22.4873 7 21.9351 7H17.9351C17.3828 7 16.9351 6.55228 16.9351 6V2Z"
          fill="#FF6B00"
        />
        <path
          d="M0.935059 2C0.935059 1.44772 1.38277 1 1.93506 1H13.9351C14.4873 1 14.9351 1.44772 14.9351 2V14C14.9351 14.5523 14.4873 15 13.9351 15H1.93506C1.38277 15 0.935059 14.5523 0.935059 14V2Z"
          fill="#027D00"
        />
        <g filter="url(#filter0_b_2620_34344)">
          <path
            d="M19.5638 22.9478C19.7578 23.1176 20.0614 22.9798 20.0614 22.7221L20.0614 17.1289C20.0614 16.5777 19.6155 16.1305 19.0643 16.1289L13.2896 16.1118C13.0172 16.111 12.8848 16.4442 13.0834 16.6306L14.4269 17.8912C11.3745 21.565 6.86456 18.5285 5.51379 15.5055C5.04661 21.5594 12.6686 26.4064 17.9833 21.5648L19.5638 22.9478Z"
            fill="url(#paint0_linear_2620_34344)"
          />
          <path
            d="M14.6192 18.0509L14.7697 17.8699L14.598 17.7088L13.2545 16.4483C13.2434 16.4379 13.2402 16.4292 13.2389 16.4227C13.2373 16.4147 13.2379 16.4042 13.2422 16.3933C13.2466 16.3824 13.2533 16.3744 13.26 16.3697C13.2654 16.3658 13.2737 16.3617 13.2888 16.3618L19.0636 16.3789C19.4769 16.3801 19.8114 16.7155 19.8114 17.1289L19.8114 22.7221C19.8114 22.765 19.7608 22.788 19.7285 22.7597L18.148 21.3767L17.98 21.2297L17.815 21.38C15.2453 23.7209 12.1287 23.7198 9.69961 22.4012C7.53018 21.2236 5.92726 19.0051 5.75812 16.4782C6.5573 17.7275 7.82168 18.8691 9.2386 19.4415C10.1135 19.7948 11.0567 19.9351 11.9882 19.738C12.9225 19.5403 13.8243 19.0077 14.6192 18.0509Z"
            stroke="url(#paint1_linear_2620_34344)"
            strokeOpacity="0.6"
            strokeWidth="0.5"
          />
        </g>
        <rect x="5" y="3" width="6" height="6" rx="3" fill="white" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.9725 15H2.02746C2.00932 14.8358 2 14.669 2 14.5C2 12.0147 4.01472 10 6.5 10H9.5C11.9853 10 14 12.0147 14 14.5C14 14.669 13.9907 14.8358 13.9725 15Z"
          fill="white"
        />
        <defs>
          <filter
            id="filter0_b_2620_34344"
            x="2.49329"
            y="12.5059"
            width="20.5681"
            height="14.0342"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="1.5" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_2620_34344" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_2620_34344" result="shape" />
          </filter>
          <linearGradient
            id="paint0_linear_2620_34344"
            x1="9.93506"
            y1="18.5"
            x2="17.9351"
            y2="17.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#027D00" />
            <stop offset="1" stopColor="#FF6B00" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2620_34344"
            x1="11.9196"
            y1="14.5538"
            x2="11.6025"
            y2="18.6176"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default TurnWebinarsIntoContent
