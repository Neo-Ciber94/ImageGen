import { BsSearch } from "react-icons/bs";
import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

const searchBarAtom = atom("");

export function useSetSearchTerm() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setText] = useAtom(searchBarAtom);

  const setRandomSearchTerm = useCallback(() => {
    const prompts: string[] = [
      "A fluffy white cat sitting on a pink pillow",
      "A serene mountain landscape with a flowing river",
      "A futuristic cityscape at night with flying cars",
      "A field of sunflowers under a bright blue sky",
      "A cozy cabin nestled in a snowy forest",
      "A vibrant underwater coral reef teeming with marine life",
      "A majestic castle on top of a hill surrounded by mist",
      "A bustling street market with colorful stalls",
      "A magical forest with glowing mushrooms and fairies",
      "A mouthwatering spread of delicious desserts on a table",
    ];

    const term = prompts[Math.floor(Math.random() * prompts.length)] as string;
    setText(term);
  }, [setText]);

  return setRandomSearchTerm;
}

export interface InputSearchBarProps {
  afterGenerate?: () => void;
}

export default function GenerateSearchBar({
  afterGenerate,
}: InputSearchBarProps) {
  const generateImage = api.images.generateImage.useMutation();
  const apiContext = api.useContext();
  const [text, setText] = useAtom(searchBarAtom);

  const handleGenerate = async () => {
    const run = async () => {
      return await generateImage.mutateAsync(
        { prompt: text },
        {
          async onSuccess() {
            setText("");
            afterGenerate?.();
            await apiContext.images.getAll.invalidate();
          },
        }
      );
    };

    const t = await toast.promise(run(), {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      error: (err) => err?.message ?? "Something went wrong",
      loading: "Loading...",
      success: "Image generated",
    });

    console.log(t);
  };

  return (
    <div className="flex w-full flex-row gap-3 overflow-hidden rounded-2xl border border-gray-300/50 bg-white shadow-md">
      <div className="flex w-full flex-row items-center gap-3 px-6 py-3 ">
        <BsSearch fontSize={22} className="text-gray-400/50" />
        <input
          id="generate-search-bar"
          className="w-full outline-none placeholder:italic "
          placeholder="Generate or search..."
          value={text}
          onInput={(e) => {
            const newText = e.currentTarget.value;
            setText(newText);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleGenerate();
            }
          }}
        />
      </div>
      {text.length > 0 && (
        <button
          onClick={() => void handleGenerate()}
          className="px-8 text-gray-500 transition duration-300 hover:bg-black hover:text-white"
        >
          Generate
        </button>
      )}
    </div>
  );
}
