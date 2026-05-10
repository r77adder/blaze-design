import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const HelpCenterIcon = forwardRef<SVGSVGElement, IconProps>(
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
          d="M9.77143 16.8569V4.51401M9.77143 16.8569L8.55687 15.6423C7.87102 14.9565 6.94123 14.5712 5.97129 14.5712H2.91349C2.40854 14.5712 2 14.1618 2 13.6569V4.05686C2 3.55192 2.40934 3.14258 2.91429 3.14258H6.42802C7.39795 3.14258 8.32816 3.52788 9.01401 4.21373L9.77143 4.97115L10.5288 4.21373C11.2147 3.52788 12.1449 3.14258 13.1148 3.14258H17.0857C17.5907 3.14258 18 3.55192 18 4.05686V13.6569C18 14.1618 17.5907 14.5712 17.0857 14.5712H13.572C12.602 14.5712 11.6718 14.9565 10.986 15.6423L9.77143 16.8569Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default HelpCenterIcon
