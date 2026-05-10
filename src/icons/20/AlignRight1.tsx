import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AlignRight1 = forwardRef<SVGSVGElement, IconProps>(
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
          d="M17.25 18C17.25 18.4142 17.5858 18.75 18 18.75C18.4142 18.75 18.75 18.4142 18.75 18H17.25ZM18.75 2C18.75 1.58579 18.4142 1.25 18 1.25C17.5858 1.25 17.25 1.58579 17.25 2L18.75 2ZM4 13.5L4 14.25L4 13.5ZM2 11.5H2.75H2ZM14 11.5H14.75H14ZM12 13.5V12.75V13.5ZM12 6.5V7.25V6.5ZM14 8.5H13.25H14ZM4 6.5L4 5.75L4 6.5ZM2 8.5H1.25H2ZM18.75 18V2L17.25 2L17.25 18H18.75ZM4 7.25L12 7.25V5.75L4 5.75L4 7.25ZM13.25 8.5V11.5H14.75V8.5H13.25ZM12 12.75L4 12.75L4 14.25L12 14.25V12.75ZM2.75 11.5L2.75 8.5L1.25 8.5L1.25 11.5H2.75ZM4 12.75C3.30964 12.75 2.75 12.1904 2.75 11.5H1.25C1.25 13.0188 2.48122 14.25 4 14.25L4 12.75ZM13.25 11.5C13.25 12.1904 12.6904 12.75 12 12.75V14.25C13.5188 14.25 14.75 13.0188 14.75 11.5H13.25ZM12 7.25C12.6904 7.25 13.25 7.80964 13.25 8.5L14.75 8.5C14.75 6.98122 13.5188 5.75 12 5.75V7.25ZM4 5.75C2.48122 5.75 1.25 6.98121 1.25 8.5L2.75 8.5C2.75 7.80964 3.30964 7.25 4 7.25L4 5.75Z"
          fill={color}
        />
      </svg>
    )
  },
)

export default AlignRight1
