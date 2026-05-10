import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AlignHorizontalCenter2 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M9.25 6C9.25 6.41421 9.58579 6.75 10 6.75C10.4142 6.75 10.75 6.41421 10.75 6H9.25ZM10.75 2C10.75 1.58579 10.4142 1.25 10 1.25C9.58579 1.25 9.25 1.58579 9.25 2H10.75ZM9.25 18C9.25 18.4142 9.58579 18.75 10 18.75C10.4142 18.75 10.75 18.4142 10.75 18H9.25ZM10.75 13.5C10.75 13.0858 10.4142 12.75 10 12.75C9.58579 12.75 9.25 13.0858 9.25 13.5H10.75ZM4 7.25H16V5.75H4V7.25ZM17.25 8.5V11.5H18.75V8.5H17.25ZM16 12.75H4V14.25H16V12.75ZM2.75 11.5V8.5H1.25V11.5H2.75ZM4 12.75C3.30964 12.75 2.75 12.1904 2.75 11.5H1.25C1.25 13.0188 2.48122 14.25 4 14.25V12.75ZM17.25 11.5C17.25 12.1904 16.6904 12.75 16 12.75V14.25C17.5188 14.25 18.75 13.0188 18.75 11.5H17.25ZM16 7.25C16.6904 7.25 17.25 7.80964 17.25 8.5H18.75C18.75 6.98122 17.5188 5.75 16 5.75V7.25ZM4 5.75C2.48122 5.75 1.25 6.98122 1.25 8.5H2.75C2.75 7.80964 3.30964 7.25 4 7.25V5.75ZM10.75 6V2H9.25V6H10.75ZM10.75 18V13.5H9.25V18H10.75Z"
          fill={color}
        />
      </svg>
    )
  },
)

export default AlignHorizontalCenter2
