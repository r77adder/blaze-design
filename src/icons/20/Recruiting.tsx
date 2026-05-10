import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Recruiting = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.5 5.5C13.5 7.433 11.933 9 10 9C8.067 9 6.5 7.433 6.5 5.5C6.5 3.567 8.067 2 10 2C11.933 2 13.5 3.567 13.5 5.5ZM2 14C2 12.3431 3.34315 11 5 11H9.59971C9.21628 11.7501 9 12.5998 9 13.5C9 15.3602 9.92345 17.0046 11.3369 18H2V14Z"
          fill="url(#paint0_linear_2724_38506)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.5 18C16.9853 18 19 15.9853 19 13.5C19 11.0147 16.9853 9 14.5 9C12.0147 9 10 11.0147 10 13.5C10 15.9853 12.0147 18 14.5 18ZM17.102 12.4473C17.3491 12.1148 17.2798 11.645 16.9473 11.398C16.6148 11.1509 16.145 11.2202 15.898 11.5527L14.0279 14.0696L13.0559 12.9965C12.7778 12.6895 12.3035 12.6661 11.9965 12.9441C11.6895 13.2222 11.6661 13.6965 11.9441 14.0035L13.5294 15.7535C13.6801 15.9199 13.8974 16.01 14.1216 15.9991C14.3458 15.9882 14.5533 15.8775 14.6872 15.6973L17.102 12.4473Z"
          fill="url(#paint1_linear_2724_38506)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2724_38506"
            x1="7.75"
            y1="2"
            x2="7.75"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5E6FFB" />
            <stop offset="1" stopColor="#2938B0" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2724_38506"
            x1="14.5"
            y1="9"
            x2="14.5"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5E6FFB" />
            <stop offset="1" stopColor="#2938B0" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default Recruiting
