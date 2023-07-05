import { useState } from "react";
import { BsSearch } from "react-icons/bs";

export interface InputSearchBarProps {
  onChange?: (s: string) => void;
}

export default function GenerateSearchBar({ onChange }: InputSearchBarProps) {
  const [text, setText] = useState("");

  return (
    <div className="flex w-full flex-row gap-3 overflow-hidden rounded-2xl border border-gray-300/50 bg-white shadow-md">
      <div className="flex w-full flex-row items-center gap-3 px-6 py-3 ">
        <BsSearch fontSize={22} className="text-gray-400/50" />
        <input
          className="w-full outline-none placeholder:italic "
          placeholder="Generate or search..."
          value={text}
          onInput={(e) => {
            const newText = e.currentTarget.value;
            setText(newText);
            if (onChange) {
              onChange(newText);
            }
          }}
        />
      </div>
      {text.length > 0 && (
        <button className="px-8 text-gray-500 transition duration-300 hover:bg-black hover:text-white">
          Generate
        </button>
      )}
    </div>
  );
}
