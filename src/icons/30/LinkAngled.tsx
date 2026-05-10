import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LinkAngled = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 30 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M9.22314 12.7384L6.43132 15.5302C5.38865 16.5729 4.78905 17.9916 4.80001 19.4826C4.81097 20.9737 5.39745 22.401 6.48959 23.4594C7.54794 24.5516 8.9756 25.1381 10.4664 25.149C11.9912 25.1602 13.3763 24.5944 14.419 23.5517L17.2108 20.7599M20.7769 17.2621L23.5687 14.4703C24.6113 13.4276 25.2109 12.0089 25.2 10.5179C25.189 9.02686 24.6025 7.5995 23.5104 6.54108C22.4523 5.48298 21.0249 4.89646 19.5339 4.88551C18.0428 4.87455 16.624 5.44012 15.5812 6.48281L12.7894 9.27463M10.7664 19.1592L19.1418 10.7838"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default LinkAngled
