import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const LinkBroken = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M6.22588 8.56937L4.36467 10.4306C3.66955 11.1257 3.26982 12.0715 3.27713 13.0655C3.28443 14.0595 3.67542 15.0111 4.40351 15.7167C5.10908 16.4448 6.06086 16.8358 7.05471 16.8431C8.07123 16.8506 8.99465 16.4734 9.6898 15.7782L11.551 13.917M13.9284 11.5851L15.7896 9.72392C16.4847 9.02881 16.8844 8.08301 16.8771 7.089C16.8698 6.09499 16.4788 5.14341 15.7507 4.4378C15.0453 3.7324 14.0937 3.34139 13.0997 3.33409C12.1057 3.32678 11.1598 3.70382 10.4646 4.39896L8.60339 6.26017M7.25471 12.8499L12.8383 7.26625M4.44684 4.34766L3.52492 3.42574M7.64809 2.72371L7.79891 1.2041M1.43481 7.56792L3.01036 7.41155M15.784 15.4215L16.706 16.3434M12.5828 17.0455L12.432 18.5651M18.7961 12.2012L17.2205 12.3576"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.8"
        />
      </svg>
    )
  },
)

export default LinkBroken
