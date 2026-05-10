import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Lazada = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M10.0043 17.6413C9.87069 17.6422 9.73913 17.608 9.62283 17.5421C8.62714 16.966 1.25276 12.3423 0.974269 12.2011C0.762326 12.1022 0.617602 11.8996 0.59277 11.667V5.18157C0.587286 4.93948 0.706964 4.71166 0.909413 4.5788L0.962823 4.54828C1.67623 4.10575 4.06439 2.64842 4.44208 2.4386C4.52875 2.38717 4.62746 2.35953 4.7282 2.35848C4.82267 2.35955 4.91551 2.38309 4.99908 2.42715C4.99908 2.42715 8.34101 4.60551 8.85221 4.80007C9.2109 4.96486 9.60202 5.047 9.99671 5.04042C10.4439 5.04976 10.8859 4.94192 11.2785 4.72759C11.7783 4.46435 14.9714 2.4386 15.0058 2.4386C15.0863 2.38997 15.1788 2.36486 15.2728 2.36611C15.3737 2.36661 15.4725 2.39428 15.5589 2.44623C15.9939 2.68657 18.9543 4.49869 19.0802 4.5788C19.2884 4.70442 19.4146 4.93079 19.4121 5.17394V11.6594C19.3887 11.8925 19.2435 12.0958 19.0306 12.1935C18.7521 12.3461 11.4006 16.9699 10.3858 17.5345C10.2703 17.6031 10.1387 17.6399 10.0043 17.6413Z"
        fill="url(#paint0_linear_4_144)"
      />
      <path
        d="M9.96614 17.6413L10.0043 17.6412C10.1379 17.6422 10.2695 17.6079 10.3858 17.5421C11.3815 16.966 18.752 12.3422 19.0305 12.2011C19.2435 12.1034 19.3887 11.9001 19.412 11.667V5.1815C19.4133 5.07171 19.3884 4.9632 19.3395 4.86487L9.96614 10.0113V17.6413Z"
        fill="url(#paint1_linear_4_144)"
      />
      <path
        d="M9.93343 17.5497L9.89568 17.5497C9.76346 17.5506 9.6333 17.5167 9.51826 17.4516C8.53315 16.8816 1.24113 12.3071 0.965598 12.1675C0.75492 12.0708 0.611279 11.8697 0.588177 11.6391V5.22269C0.586961 5.11407 0.611529 5.0067 0.659888 4.90942L9.93343 10.001V17.5497Z"
        fill="url(#paint2_linear_4_144)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4_144"
          x1="0.581158"
          y1="2.49814"
          x2="19.2276"
          y2="2.35371"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="1e-07" stopColor="#FF9200" />
          <stop offset="0.337553" stopColor="#F36D00" />
          <stop offset="0.56729" stopColor="#F83C72" />
          <stop offset="0.78" stopColor="#FC1CBE" />
          <stop offset="0.93" stopColor="#FE08ED" />
          <stop offset="1" stopColor="#FF00FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_4_144"
          x1="5.81945"
          y1="16.0464"
          x2="24.8304"
          y2="5.52018"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EE0A3F" />
          <stop offset="1" stopColor="#EE0A3F" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_4_144"
          x1="7.6694"
          y1="13.3031"
          x2="-1.51711"
          y2="5.90285"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ED6600" />
          <stop offset="1" stopColor="#F98200" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Lazada
