import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Plans = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M2.04492 18.4392C3.98042 16.7446 6.8368 15.6729 10.0228 15.6729C13.2089 15.6729 16.0653 16.7446 18.0008 18.4392"
        stroke="url(#paint0_linear_9908_74332)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.0879 15.6392C10.0879 10.7138 14.2128 7.17081 17.249 6.125C17.249 9.1875 15.124 13.0625 11.4711 11.2536"
        stroke="url(#paint1_linear_9908_74332)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0558 15.5716C10.0879 13.4511 9.52337 11.0434 8.25 9.24988M8.25 9.24988C5.9553 10.2957 1.97514 7.96792 2.4813 2.46899C7.87963 2.46899 10.6446 6.68596 8.25 9.24988ZM8.25 9.24988C6.76489 7.15826 6.49796 6.69554 5.25 5.31238"
        stroke="url(#paint2_linear_9908_74332)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_9908_74332"
          x1="17.8187"
          y1="15.8094"
          x2="2.28481"
          y2="19.2218"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC934" />
          <stop offset="0.293264" stopColor="#F9AD11" />
          <stop offset="1" stopColor="#EE8330" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_9908_74332"
          x1="17.1673"
          y1="6.59473"
          x2="9.86512"
          y2="6.80406"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC934" />
          <stop offset="0.293264" stopColor="#F9AD11" />
          <stop offset="1" stopColor="#EE8330" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_9908_74332"
          x1="9.97017"
          y1="3.11589"
          x2="2.1979"
          y2="3.28803"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC934" />
          <stop offset="0.293264" stopColor="#F9AD11" />
          <stop offset="1" stopColor="#EE8330" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Plans
