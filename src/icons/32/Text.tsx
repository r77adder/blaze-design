import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Text = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 32 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <g filter="url(#filter0_d_7761_471687)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.9134 8.04102C12.8851 8.23747 12.8594 8.41618 12.8268 8.58286C12.8745 8.4608 12.9234 8.33386 12.9739 8.20304C13.45 6.96857 14.0593 5.38871 14.9969 4.30053C16.3795 3.50148 17.9615 3.06836 19.5911 3.06836H21.1517C16.9794 5.15447 13.0479 11.52 10.0022 16.4514C9.77134 16.8252 9.54557 17.1908 9.32516 17.5456C8.11221 14.6677 8.50778 11.3901 10.3098 8.89709C10.1405 10.3875 10.0564 11.9884 10.1846 12.8706C10.4029 11.156 10.8189 8.59332 11.7918 7.18228L12.7916 6.08028C13.0562 5.78871 13.3376 5.51618 13.6337 5.26364C13.131 6.52964 13.0079 7.3844 12.9134 8.04102Z"
          fill="url(#paint0_linear_7761_471687)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.1444 17.2985L10.4912 17.3754C12.2866 12.4381 16.6629 5.3126 21.1514 3.06836L21.4142 5.19927C21.5092 5.96904 21.4563 6.74294 21.2652 7.48152C20.5446 8.67491 18.6566 9.39279 17.2115 9.9423C16.9293 10.0496 16.6641 10.1504 16.4277 10.2472C16.6599 10.2198 16.9417 10.1976 17.2568 10.1728C18.0788 10.1082 19.1276 10.0258 20.1135 9.78584C20.0852 9.83442 20.0566 9.88236 20.0277 9.92969L19.5185 10.665C18.1548 12.4067 16.3495 13.1263 14.8737 13.7146C14.7101 13.7798 14.5506 13.8433 14.3962 13.9065C15.2434 13.8065 16.6758 13.3485 18.0207 12.8279L17.6196 13.4073C16.1195 15.5734 13.7612 16.9907 11.1444 17.2985ZM20.1233 9.78345L20.1263 9.78742L20.1302 9.78177C20.1279 9.78233 20.1256 9.78289 20.1233 9.78345Z"
          fill="url(#paint1_linear_7761_471687)"
        />
        <path
          d="M8.85456 21.3489H7.17139C11.9377 12.8362 16.7832 5.02016 21.1517 3.06836C19.2681 3.90995 12.82 10.6887 8.85456 21.3489Z"
          fill="url(#paint2_linear_7761_471687)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_7761_471687"
          x="0.836864"
          y="0.373444"
          width="27.1515"
          height="30.8565"
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
          <feOffset dy="3.59322" />
          <feGaussianBlur stdDeviation="3.14407" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7761_471687" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7761_471687" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_7761_471687"
          x1="14.3521"
          y1="9.52441"
          x2="12.201"
          y2="8.1158"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1B84FF" />
          <stop offset="1" stopColor="#1E85FF" stopOpacity="0.42" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_7761_471687"
          x1="21.4603"
          y1="7.95498"
          x2="10.2247"
          y2="15.7684"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.00879028" stopColor="#006EEE" stopOpacity="0.55" />
          <stop offset="0.518605" stopColor="#1B84FF" />
          <stop offset="0.776512" stopColor="#F167CB" />
          <stop offset="1" stopColor="#F0B570" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_7761_471687"
          x1="10.9753"
          y1="13.0994"
          x2="14.0003"
          y2="15.0244"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1C85FF" />
          <stop offset="1" stopColor="#002F5F" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Text
