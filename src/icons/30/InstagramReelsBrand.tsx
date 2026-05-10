import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const InstagramReelsBrand = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 30, ...rest }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
        {...rest}
      >
        <rect width="30" height="30" rx="6" fill="url(#paint0_radial_12220_1824)" />
        <rect width="30" height="30" rx="6" fill="url(#paint1_radial_12220_1824)" />
        <g clipPath="url(#clip0_12220_1824)">
          <path
            d="M10.5418 4.5H19.4582C21.1174 4.5 22.627 5.17676 23.7222 6.26367C24.8191 7.35229 25.5 8.85449 25.5 10.5054V19.4963C25.5 21.1438 24.8191 22.6443 23.7256 23.7329L23.7222 23.7363C22.6253 24.825 21.1157 25.5 19.46 25.5H10.5418C8.88087 25.5 7.36958 24.8232 6.27436 23.7363L6.23309 23.6902C5.16366 22.6067 4.5 21.1233 4.5 19.4946V10.5054C4.5 8.85278 5.17914 7.35229 6.27436 6.26367C7.36958 5.17505 8.87916 4.5 10.5418 4.5ZM20.2337 9.80127L20.2457 9.82007H23.9595C23.8099 8.84937 23.3439 7.97778 22.6734 7.30957C21.8481 6.48926 20.7099 5.97998 19.4582 5.97998H17.9332L20.2337 9.80127ZM18.516 9.82007L16.2035 5.97998H11.1315L13.4715 9.82007H18.516ZM11.7401 9.82007L9.47748 6.10474C8.65048 6.30298 7.90945 6.72852 7.32659 7.30957C6.65605 7.97607 6.19183 8.84937 6.04053 9.82007H11.7401ZM24.0111 11.3H5.98895V19.4963C5.98895 20.7217 6.48584 21.8376 7.28877 22.6545L7.32659 22.6904C8.15187 23.5107 9.2918 24.0217 10.5418 24.0217H19.4582C20.7099 24.0217 21.8481 23.5125 22.6717 22.6938L22.6751 22.6904C23.4987 21.8718 24.0111 20.7405 24.0111 19.4963V11.3ZM13.26 13.8909L17.873 16.873C17.9469 16.9209 18.014 16.9824 18.0673 17.0576C18.2771 17.3601 18.1997 17.7754 17.8954 17.9839L13.3013 20.679C13.1861 20.773 13.0382 20.8293 12.8749 20.8293C12.5035 20.8293 12.2026 20.5303 12.2026 20.1611V14.4377H12.2061C12.2061 14.3062 12.2456 14.1729 12.3264 14.0566C12.5396 13.7542 12.9574 13.6807 13.26 13.8909Z"
            fill="white"
          />
        </g>
        <defs>
          <radialGradient
            id="paint0_radial_12220_1824"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(3.86625 30.1425) scale(39.1631)"
          >
            <stop offset="0.09" stopColor="#FFC800" />
            <stop offset="0.78" stopColor="#F51780" />
          </radialGradient>
          <radialGradient
            id="paint1_radial_12220_1824"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(16.6667 26.6667) scale(28.3333)"
          >
            <stop offset="0.605" stopColor="#8C3AAA" stopOpacity="0" />
            <stop offset="1" stopColor="#8C3AAA" />
          </radialGradient>
          <clipPath id="clip0_12220_1824">
            <rect width="21" height="21" fill="white" transform="translate(4.5 4.5)" />
          </clipPath>
        </defs>
      </svg>
    )
  },
)

export default InstagramReelsBrand
