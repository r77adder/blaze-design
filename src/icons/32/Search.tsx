import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Search = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 32 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 32 32`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 13.5C5.5 9.08172 9.08172 5.5 13.5 5.5C17.9183 5.5 21.5 9.08172 21.5 13.5C21.5 17.9183 17.9183 21.5 13.5 21.5C9.08172 21.5 5.5 17.9183 5.5 13.5ZM13.5 3.5C7.97715 3.5 3.5 7.97715 3.5 13.5C3.5 19.0228 7.97715 23.5 13.5 23.5C15.9013 23.5 18.1049 22.6536 19.8287 21.2429L27.7929 29.2071C28.1834 29.5976 28.8166 29.5976 29.2071 29.2071C29.5976 28.8166 29.5976 28.1834 29.2071 27.7929L21.2429 19.8287C22.6536 18.1049 23.5 15.9013 23.5 13.5C23.5 7.97715 19.0228 3.5 13.5 3.5Z"
        fill={color}
      />
    </svg>
  )
})

export default Search
