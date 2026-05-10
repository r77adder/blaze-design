import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Emails = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      ref={forwardedRef}
    >
      <path
        d="M2.5 9.32827V14.8682C2.5 15.8616 3.33947 16.6668 4.375 16.6668H15.625C16.6605 16.6668 17.5 15.8616 17.5 14.8682V9.74789C17.5 8.95467 16.6207 8.47721 15.9554 8.90919L10 12.7763C10 12.7763 5.38922 9.8979 3.39065 8.77215C2.90946 8.5011 2.5 8.77598 2.5 9.32827Z"
        fill="url(#paint0_linear_2721_29319)"
      />
      <path
        d="M2.5 14.8682V8.32852M2.5 14.8682C2.5 15.8616 3.33947 16.6668 4.375 16.6668H15.625C16.6605 16.6668 17.5 15.8616 17.5 14.8682M2.5 14.8682V9.32827C2.5 8.77598 2.90946 8.5011 3.39065 8.77215C5.38922 9.8979 10 12.7763 10 12.7763M2.5 8.32852C2.5 8.01844 2.66652 7.73024 2.94063 7.5659L10 3.3335L17.0221 7.12256C17.3173 7.28184 17.5 7.58148 17.5 7.90638M2.5 8.32852C2.875 8.32852 10 12.7763 10 12.7763M17.5 7.90638V14.8682M17.5 7.90638L10 12.7763M17.5 14.8682V9.74789C17.5 8.95467 16.6207 8.47721 15.9554 8.90919L10 12.7763"
        stroke="url(#paint1_linear_2721_29319)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2721_29319"
          x1="10"
          y1="3.3335"
          x2="10"
          y2="16.6668"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FEA50A" />
          <stop offset="1" stopColor="#E97D00" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2721_29319"
          x1="10"
          y1="3.3335"
          x2="10"
          y2="16.6668"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FEA50A" />
          <stop offset="1" stopColor="#E97D00" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Emails
