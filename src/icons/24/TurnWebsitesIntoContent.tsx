import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TurnWebsitesIntoContent = forwardRef<SVGSVGElement, IconProps>(
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
        <g filter="url(#filter0_d_4895_104464)">
          <path
            d="M2.30869 5C2.30869 3.34315 3.65183 2 5.30869 2H19.3087C20.9655 2 22.3087 3.34315 22.3087 5V19C22.3087 20.6569 20.9655 22 19.3087 22H5.30869C3.65183 22 2.30869 20.6569 2.30869 19V5Z"
            fill="#01AD5A"
          />
        </g>
        <g clipPath="url(#clip0_4895_104464)">
          <path
            d="M2.30869 5C2.30869 3.34315 3.65183 2 5.30869 2H19.3087C20.9655 2 22.3087 3.34315 22.3087 5V18H2.30869V5Z"
            fill="#008B48"
          />
          <path
            d="M4.74619 5.62509C4.74619 5.0728 5.1939 4.62509 5.74619 4.62509H5.87119C6.42347 4.62509 6.87119 5.0728 6.87119 5.62509C6.87119 6.17737 6.42347 6.62509 5.87119 6.62509H5.74619C5.1939 6.62509 4.74619 6.17737 4.74619 5.62509Z"
            fill="#00BF62"
          />
          <path
            d="M4.74619 11.0001C4.74619 10.4478 5.1939 10.0001 5.74619 10.0001H17.7462C18.2985 10.0001 18.7462 10.4478 18.7462 11.0001C18.7462 11.5524 18.2985 12.0001 17.7462 12.0001H5.74619C5.1939 12.0001 4.74619 11.5524 4.74619 11.0001Z"
            fill="#00BF62"
          />
          <g filter="url(#filter1_d_4895_104464)">
            <rect x="4.74619" y="13.2275" width="5.625" height="2.20117" rx="1.10059" fill="#00FF94" />
          </g>
        </g>
        <g filter="url(#filter2_bddd_4895_104464)">
          <path
            d="M13.0235 19.4727L10.6043 11.1426C10.4989 10.7795 10.819 10.4353 11.1888 10.5141L19.5346 12.2938C19.9477 12.3819 20.0722 12.9108 19.7418 13.1739L17.7332 14.7736C17.4952 14.9632 17.4803 15.3197 17.7018 15.5285L19.7012 17.4133C19.8992 17.6 19.9116 17.9108 19.7289 18.1126L18.5876 19.3738C18.3981 19.5832 18.0728 19.5942 17.8696 19.3981L15.9677 17.5624C15.7419 17.3445 15.3735 17.386 15.2019 17.6486L13.9222 19.6068C13.6885 19.9645 13.1427 19.8831 13.0235 19.4727Z"
            fill="white"
            fillOpacity="0.83"
            shapeRendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_4895_104464"
            x="0.308685"
            y="1"
            width="24"
            height="24"
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
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4895_104464" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4895_104464" result="shape" />
          </filter>
          <filter
            id="filter1_d_4895_104464"
            x="1.74619"
            y="12.2275"
            width="11.625"
            height="8.20117"
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
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4895_104464" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4895_104464" result="shape" />
          </filter>
          <filter
            id="filter2_bddd_4895_104464"
            x="6.58395"
            y="9.50278"
            width="17.3467"
            height="18.3306"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="0.5" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_4895_104464" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="effect1_backgroundBlur_4895_104464" result="effect2_dropShadow_4895_104464" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.5" />
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0" />
            <feBlend mode="normal" in2="effect2_dropShadow_4895_104464" result="effect3_dropShadow_4895_104464" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" />
            <feBlend mode="normal" in2="effect3_dropShadow_4895_104464" result="effect4_dropShadow_4895_104464" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_4895_104464" result="shape" />
          </filter>
          <clipPath id="clip0_4895_104464">
            <path
              d="M2.30869 5C2.30869 3.34315 3.65183 2 5.30869 2H19.3087C20.9655 2 22.3087 3.34315 22.3087 5V18H2.30869V5Z"
              fill="white"
            />
          </clipPath>
        </defs>
      </svg>
    )
  },
)

export default TurnWebsitesIntoContent
