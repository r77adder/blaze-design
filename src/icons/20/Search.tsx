import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Search = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M12.7508 12.8492L16.8596 16.958M14.4725 8.75189C14.4725 11.9199 11.9043 14.4882 8.73627 14.4882C5.56821 14.4882 3 11.9199 3 8.75189C3 5.58384 5.56821 3.01562 8.73627 3.01562C11.9043 3.01562 14.4725 5.58384 14.4725 8.75189Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Search
