import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FilePlus2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M11.925 21.5998H5.93436C4.60888 21.5998 3.53436 20.5253 3.53437 19.1998L3.53447 4.79989C3.53447 3.47441 4.60899 2.3999 5.93447 2.3999H16.1156C17.4411 2.3999 18.5156 3.47442 18.5156 4.7999V8.2499M8.14725 7.1999H13.8375M8.14725 10.7999H13.8375M8.14725 14.3999H10.2375"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.2406 22.1249L17.2406 17.3249M17.2406 17.3249L17.2406 12.5249M17.2406 17.3249L12.4406 17.3249M17.2406 17.3249L22.0406 17.3249"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default FilePlus2
