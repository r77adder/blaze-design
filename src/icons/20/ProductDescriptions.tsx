import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ProductDescriptions = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="none">
        <path
          d="M5.5 4.75C4.5335 4.75 3.75 5.5335 3.75 6.5V10.5C3.75 11.4665 4.5335 12.25 5.5 12.25H14.5C15.4665 12.25 16.25 11.4665 16.25 10.5V6.5C16.25 5.5335 15.4665 4.75 14.5 4.75H5.5Z"
          fill="url(#paint0_linear_3222_281)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5 2.25C2.92893 2.25 1.25 3.92893 1.25 6V11C1.25 13.0711 2.92893 14.75 5 14.75H9.25V16.25H7C6.58579 16.25 6.25 16.5858 6.25 17C6.25 17.4142 6.58579 17.75 7 17.75H13C13.4142 17.75 13.75 17.4142 13.75 17C13.75 16.5858 13.4142 16.25 13 16.25H10.75V14.75H15C17.0711 14.75 18.75 13.0711 18.75 11V6C18.75 3.92893 17.0711 2.25 15 2.25H5ZM17.25 11C17.25 12.2426 16.2426 13.25 15 13.25H5C3.75736 13.25 2.75 12.2426 2.75 11V6C2.75 4.75736 3.75736 3.75 5 3.75H15C16.2426 3.75 17.25 4.75736 17.25 6V11Z"
          fill="url(#paint1_linear_3222_281)"
        />
        <defs>
          <linearGradient id="paint0_linear_3222_281" x1="10" y1="3" x2="10" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF3E7E" />
            <stop offset="1" stopColor="#C2004E" />
          </linearGradient>
          <linearGradient id="paint1_linear_3222_281" x1="10" y1="3" x2="10" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF3E7E" />
            <stop offset="1" stopColor="#C2004E" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default ProductDescriptions
