import { forwardRef } from 'react'
import { IconProps } from '../Types'

// FIXME: This icon is not standardized to 20x20
export const CurrencyDollar = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 13 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M9.98148 6.29613C9.79718 5.77321 9.4606 5.3174 9.01506 4.98737C8.56953 4.65734 8.03542 4.4682 7.48148 4.44428H3.77778C3.04107 4.44428 2.33453 4.73694 1.81359 5.25787C1.29266 5.77881 1 6.48535 1 7.22206C1 7.95877 1.29266 8.66531 1.81359 9.18624C2.33453 9.70718 3.04107 9.99984 3.77778 9.99984H7.48148C8.21819 9.99984 8.92473 10.2925 9.44567 10.8134C9.9666 11.3344 10.2593 12.0409 10.2593 12.7776C10.2593 13.5143 9.9666 14.2209 9.44567 14.7418C8.92473 15.2627 8.21819 15.5554 7.48148 15.5554H3.77778C3.22384 15.5315 2.68973 15.3423 2.24419 15.0123C1.79866 14.6823 1.46208 14.2265 1.27778 13.7035M5.62963 1.6665V4.44428M5.62963 15.5554V18.3332"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default CurrencyDollar
