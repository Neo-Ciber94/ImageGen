import {
  useRef,
  type ComponentType,
  type DOMAttributes,
  useEffect,
  useState,
} from "react";

interface MouseEventsProps<T> {
  onMouseDown: DOMAttributes<T>["onMouseDown"];
  onMouseUp: DOMAttributes<T>["onMouseUp"];
  onMouseLeave: DOMAttributes<T>["onMouseLeave"];
  onTouchStart: DOMAttributes<T>["onTouchStart"];
  onTouchEnd: DOMAttributes<T>["onTouchEnd"];
}

export function withLongPress<P extends object>(
  Component: ComponentType<P & MouseEventsProps<unknown>>,
  delayMs: number
) {
  return function WithLongPress(props: P & { onLongPress: () => void }) {
    const timeoutRef = useRef<number | null>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const { onLongPress, ...rest } = props;
    const onLongPressRef = useRef(onLongPress);

    useEffect(() => {
      const timeout = timeoutRef.current;
      if (isMouseDown) {
        timeoutRef.current = window.setTimeout(() => {
          onLongPressRef.current();
        }, delayMs);
      } else {
        if (timeout) {
          window.clearTimeout(timeout);
        }
      }

      return () => {
        if (timeout) {
          window.clearTimeout(timeout);
        }
      };
    }, [isMouseDown]);

    return (
      <Component
        {...(rest as unknown as P)}
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
        onTouchStart={() => setIsMouseDown(true)}
        onTouchEnd={() => setIsMouseDown(false)}
      />
    );
  };
}
