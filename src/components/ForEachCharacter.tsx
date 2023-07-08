export interface ForEachCharacterProps {
  text: string;
  className?: string | ((char: string, index: number) => string);
}

export function ForEachCharacter({ text, className }: ForEachCharacterProps) {
  return text.split("").map((char, idx) => {
    return (
      <span
        key={idx}
        className={
          className == null
            ? undefined
            : typeof className === "string"
            ? className
            : className(char, idx)
        }
      >
        {char}
      </span>
    );
  });
}
