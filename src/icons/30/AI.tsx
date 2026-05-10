import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AI = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 30 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.4677 24.275H3.29838C1.11652 24.275 -0.234404 21.8985 0.881759 20.0237L5.46066 12.3329C5.58143 12.13 5.72726 11.9432 5.89471 11.7768L12.499 5.21319C13.0258 4.68962 13.7384 4.39569 14.4811 4.39557L26.5425 4.39355C28.3349 4.39326 29.6702 6.04709 29.2923 7.79911L26.2169 22.0556C25.9376 23.3505 24.7924 24.275 23.4677 24.275ZM24.123 22.0725H16.7671L16.6924 19.2897H12.145L10.8626 22.0725H6.63574L14.4857 6.5954H19.334L20.5614 21.096L23.6904 6.5954H27.4628L24.123 22.0725ZM16.5035 9.59787H16.4662C15.7679 11.2928 14.995 13.1193 14.2024 14.8142L13.7127 15.8793H16.6001L16.5628 14.8142C16.5057 13.1193 16.4882 11.2928 16.5057 9.59787H16.5035Z"
        fill={color}
      />
    </svg>
  )
})

export default AI
