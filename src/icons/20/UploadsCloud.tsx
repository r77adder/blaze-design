import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const UploadsCloud = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 27 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g filter="url(#filter0_di_2624_1522)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.8251 9.74511C14.8543 9.70291 14.8827 9.66019 14.9104 9.61698C14.9574 9.66103 15.0056 9.70376 15.0551 9.74511H14.8251ZM7.46056 17.7962C7.47061 17.7963 7.48066 17.7963 7.49072 17.7963C7.50078 17.7963 7.51084 17.7963 7.52089 17.7962H19.5491C19.5591 17.7963 19.5691 17.7963 19.5791 17.7963C19.5891 17.7963 19.599 17.7963 19.609 17.7962H19.9634V17.7821C22.6113 17.5856 24.6986 15.3749 24.6986 12.6767C24.6986 10.1864 22.9206 8.11134 20.5647 7.65191C20.5889 7.48852 20.6015 7.32133 20.6015 7.1512C20.6015 5.28463 19.0884 3.77148 17.2218 3.77148C16.3277 3.77148 15.5148 4.11864 14.9103 4.68552C14.0974 3.41858 12.6764 2.5791 11.0593 2.5791C8.53415 2.5791 6.4871 4.62616 6.4871 7.15132C6.4871 7.27259 6.49182 7.39275 6.50108 7.51164C4.10837 7.97364 2.30127 10.0792 2.30127 12.6068C2.30127 15.3917 4.49492 17.6642 7.24854 17.7907V17.7962H7.46056Z"
            fill="url(#paint0_linear_2624_1522)"
          />
        </g>
        <g filter="url(#filter1_d_2624_1522)">
          <path
            d="M20.0755 14.1626L13.1436 6.84462L6.08669 14.1627L9.89894 14.1627C10.1223 15.7644 11.2704 20.5212 13.1439 23.956C15.2006 19.4782 16.0161 17.2114 16.5783 14.1626L20.0755 14.1626Z"
            fill="url(#paint1_linear_2624_1522)"
          />
          <path
            d="M10.1465 14.1282L10.1165 13.9127L9.89894 13.9127L6.67507 13.9127L13.1419 7.20645L19.4944 13.9126L16.5783 13.9126L16.3702 13.9126L16.3325 14.1173C15.7952 17.0307 15.026 19.2233 13.1278 23.3902C11.4117 20.0342 10.3575 15.6412 10.1465 14.1282Z"
            stroke="url(#paint2_linear_2624_1522)"
            strokeOpacity="0.4"
            strokeWidth="0.5"
          />
        </g>
        <defs>
          <filter
            id="filter0_di_2624_1522"
            x="0.30127"
            y="1.5791"
            width="26.3975"
            height="19.2173"
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
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2624_1522" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2624_1522" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.5" dy="0.5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2624_1522" />
          </filter>
          <filter
            id="filter1_d_2624_1522"
            x="4.08667"
            y="5.84473"
            width="17.9888"
            height="21.1113"
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
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2624_1522" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2624_1522" result="shape" />
          </filter>
          <linearGradient
            id="paint0_linear_2624_1522"
            x1="13.5"
            y1="3.41699"
            x2="13.5"
            y2="17.796"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#83E1FF" />
            <stop offset="1" stopColor="#0074C7" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2624_1522"
            x1="13.5445"
            y1="23.956"
            x2="13.5445"
            y2="10.026"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#CE00AD" />
            <stop offset="1" stopColor="#FFC700" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_2624_1522"
            x1="8.48775"
            y1="10.7696"
            x2="17.773"
            y2="22.7911"
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

export default UploadsCloud
