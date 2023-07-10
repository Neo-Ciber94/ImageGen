import { Oval } from "react-loader-spinner";

export interface LoadingIndicatorProps {
  size?: number;
  width?: number;
}

export default function LoadingIndicator({
  size = 40,
  width = 4,
}: LoadingIndicatorProps) {
  return (
    <div className="flex w-full flex-row justify-center">
      <Oval
        visible
        height={size}
        width={size}
        ariaLabel="loading"
        color="rgb(168 85 247)"
        secondaryColor="rgba(255, 255, 255, 0.2)"
        strokeWidth={width}
        strokeWidthSecondary={width}
      />
    </div>
  );
}
