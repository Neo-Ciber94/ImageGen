export interface LoadingIndicatorProps {
  size?: number;
}

export default function LoadingIndicator({ size = 14 }: LoadingIndicatorProps) {
  return (
    <div
      className="w-full animate-pulse text-purple-500"
      style={{
        fontSize: size,
      }}
    >
      Loading...
    </div>
  );
}
