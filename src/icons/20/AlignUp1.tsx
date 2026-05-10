import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AlignUp1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M18 2.75C18.4142 2.75 18.75 2.41421 18.75 2C18.75 1.58579 18.4142 1.25 18 1.25V2.75ZM2 1.25C1.58579 1.25 1.25 1.58579 1.25 2C1.25 2.41421 1.58579 2.75 2 2.75L2 1.25ZM13.5 16H14.25H13.5ZM11.5 18V18.75V18ZM11.5 6V5.25V6ZM13.5 8H12.75H13.5ZM6.5 8L5.75 8L6.5 8ZM8.5 6V6.75H8.5L8.5 6ZM6.5 16H7.25H6.5ZM8.5 18L8.5 17.25L8.5 18ZM18 1.25L2 1.25L2 2.75L18 2.75V1.25ZM7.25 16L7.25 8L5.75 8L5.75 16H7.25ZM8.5 6.75L11.5 6.75V5.25L8.5 5.25L8.5 6.75ZM12.75 8V16H14.25V8H12.75ZM11.5 17.25L8.5 17.25L8.5 18.75H11.5V17.25ZM12.75 16C12.75 16.6904 12.1904 17.25 11.5 17.25V18.75C13.0188 18.75 14.25 17.5188 14.25 16H12.75ZM11.5 6.75C12.1904 6.75 12.75 7.30964 12.75 8L14.25 8C14.25 6.48122 13.0188 5.25 11.5 5.25V6.75ZM7.25 8C7.25 7.30964 7.80964 6.75 8.5 6.75L8.5 5.25C6.98122 5.25 5.75 6.48122 5.75 8L7.25 8ZM5.75 16C5.75 17.5188 6.98121 18.75 8.5 18.75L8.5 17.25C7.80964 17.25 7.25 16.6904 7.25 16H5.75Z"
        fill={color}
      />
    </svg>
  )
})

export default AlignUp1
