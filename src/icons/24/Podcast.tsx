import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Podcast = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
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
        d="M10.5193 3.60916C10.5193 2.79137 11.1822 2.12842 12 2.12842C12.8178 2.12842 13.4808 2.79137 13.4808 3.60916V20.3909C13.4808 21.2087 12.8178 21.8717 12 21.8717C11.1822 21.8717 10.5193 21.2087 10.5193 20.3909V3.60916Z"
        fill="url(#paint0_linear_2675_210)"
      />
      <path
        d="M14.5913 8.2366C14.5913 7.41881 15.2543 6.75586 16.0721 6.75586C16.8898 6.75586 17.5528 7.41881 17.5528 8.2366V15.763C17.5528 16.5808 16.8898 17.2437 16.0721 17.2437C15.2543 17.2437 14.5913 16.5808 14.5913 15.763V8.2366Z"
        fill="url(#paint1_linear_2675_210)"
      />
      <path
        d="M6.44727 8.2366C6.44727 7.41881 7.11022 6.75586 7.92801 6.75586C8.7458 6.75586 9.40875 7.41881 9.40875 8.2366V15.763C9.40875 16.5808 8.7458 17.2437 7.92801 17.2437C7.11022 17.2437 6.44727 16.5808 6.44727 15.763V8.2366Z"
        fill="url(#paint2_linear_2675_210)"
      />
      <path
        d="M2.375 11.9768C2.375 11.159 3.03795 10.4961 3.85574 10.4961C4.67354 10.4961 5.33649 11.159 5.33649 11.9768V12.0234C5.33649 12.8411 4.67354 13.5041 3.85574 13.5041C3.03795 13.5041 2.375 12.8411 2.375 12.0234V11.9768Z"
        fill="url(#paint3_linear_2675_210)"
      />
      <path
        d="M18.6636 11.9768C18.6636 11.159 19.3265 10.4961 20.1443 10.4961C20.9621 10.4961 21.6251 11.159 21.6251 11.9768V12.0234C21.6251 12.8411 20.9621 13.5041 20.1443 13.5041C19.3265 13.5041 18.6636 12.8411 18.6636 12.0234V11.9768Z"
        fill="url(#paint4_linear_2675_210)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2675_210"
          x1="12"
          y1="2.12842"
          x2="12"
          y2="21.8717"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC1E28" />
          <stop offset="1" stopColor="#960007" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2675_210"
          x1="16.0721"
          y1="6.75586"
          x2="16.0721"
          y2="17.2437"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC1E28" />
          <stop offset="1" stopColor="#960007" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2675_210"
          x1="7.92801"
          y1="6.75586"
          x2="7.92801"
          y2="17.2437"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC1E28" />
          <stop offset="1" stopColor="#960007" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_2675_210"
          x1="3.85574"
          y1="10.4961"
          x2="3.85574"
          y2="13.5041"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC1E28" />
          <stop offset="1" stopColor="#960007" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_2675_210"
          x1="20.1443"
          y1="10.4961"
          x2="20.1443"
          y2="13.5041"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC1E28" />
          <stop offset="1" stopColor="#960007" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Podcast
