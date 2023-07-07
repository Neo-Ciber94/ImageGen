import { BsSearch } from "react-icons/bs";
import { useAtom } from "jotai";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { deferred } from "~/utils/promises";
import { promptTextAtom } from "~/atoms/promptTextAtom";

export interface InputSearchBarProps {
  afterGenerate?: () => void;
}

export default function GenerateSearchBar({
  afterGenerate,
}: InputSearchBarProps) {
  const generateImage = api.images.generateImage.useMutation();
  const apiContext = api.useContext();
  const [text, setText] = useAtom(promptTextAtom);

  const handleGenerate = async () => {
    const toastPromise = deferred<void>();
    void toast.promise(toastPromise.promise, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      error: (err) => err?.message ?? "Something went wrong",
      loading: "Loading...",
      success: "Image generated",
    });

    try {
      const result = await generateImage.mutateAsync({ prompt: text });
      setText("");
      afterGenerate?.();
      await apiContext.images.getAll.invalidate();
      toastPromise.resolve();
      console.log(result);
    } catch (err) {
      console.error(err);
      toastPromise.reject(err);
    }
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
          disabled={generateImage.isLoading}
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
          disabled={generateImage.isLoading}
          className={`px-8 text-gray-500 transition duration-300 hover:bg-black hover:text-white disabled:bg-black`}
        >
          Generate
        </button>
      )}
    </div>
  );
}
