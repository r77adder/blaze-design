import { forwardRef, type SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: number;
}

// Source viewBox is 0 0 15 15 (the authored coordinate system); width/height
// scale the rendered size as the consumer requests.
const Map02 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, ...rest }, ref) => (
    <svg ref={ref} width={size} height={size} viewBox="0 0 15 15" fill="none" {...rest}>
      <path
        d="M2.01822 3.54167L11.5185 12.8166M2.01822 3.54167C2.37169 3.13813 2.89963 2.88194 3.48948 2.88194H6.70111M2.01822 3.54167C1.73393 3.86623 1.5625 4.28611 1.5625 4.74469V11.5748C1.5625 12.6035 2.42524 13.4375 3.48948 13.4375H10.5551C11.6193 13.4375 12.482 12.6035 12.482 11.5748V8.78064M6.70111 8.78064L2.52599 12.8166M11.2536 3.67361V3.63392M13.4375 3.62772C13.4375 5.00453 11.2536 6.84028 11.2536 6.84028C11.2536 6.84028 9.06968 5.00453 9.06968 3.62772C9.06968 2.48713 10.0475 1.5625 11.2536 1.5625C12.4597 1.5625 13.4375 2.48713 13.4375 3.62772Z"
        stroke={color}
        strokeOpacity="0.9"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
);
Map02.displayName = 'Map02';
export default Map02;
