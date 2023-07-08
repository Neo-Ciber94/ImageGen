import { BsSearch } from "react-icons/bs";
import { useAtom } from "jotai";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { deferred } from "~/utils/promises";
import { generateImageSearchBarAtom } from "~/atoms/promptTextAtom";

export interface InputSearchBarProps {
  afterGenerate?: () => void;
}

export default function GenerateImageSearchBar({
  afterGenerate,
}: InputSearchBarProps) {
  const generateImage = api.images.generateImage.useMutation();
  const apiContext = api.useContext();
  const [searchBarState, setSearchBarState] = useAtom(
    generateImageSearchBarAtom
  );

  const handleGenerate = async () => {
    const toastPromise = deferred<void>();
    void toast.promise(toastPromise.promise, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      error: (err) => err?.message ?? "Something went wrong",
      loading: "Generating...",
      success: "Image generated",
    });

    setSearchBarState((p) => ({ ...p, loading: true }));

    try {
      const result = await generateImage.mutateAsync({
        prompt: searchBarState.text,
      });
      setSearchBarState((p) => ({ ...p, text: "" }));
      await apiContext.images.getAll.invalidate();
      afterGenerate?.();
      toastPromise.resolve();
      console.log(result);
    } catch (err) {
      console.error(err);
      toastPromise.reject(err);
    } finally {
      setSearchBarState((p) => ({ ...p, loading: false }));
    }
  };

  return (
    <div
      className="flex w-full flex-row gap-3 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-md 
    dark:border-violet-800/20 dark:bg-slate-900 dark:text-white"
    >
      <div className="flex w-full flex-row items-center gap-3 px-6 py-3 ">
        <BsSearch
          fontSize={22}
          className="text-gray-400/50 dark:text-violet-500"
        />
        <input
          id="generate-search-bar"
          className="w-full bg-transparent outline-none placeholder:italic dark:placeholder:text-violet-300"
          placeholder="Generate or search..."
          value={searchBarState.text}
          disabled={generateImage.isLoading}
          onInput={(e) => {
            const newText = e.currentTarget.value;
            setSearchBarState((p) => ({ ...p, text: newText }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleGenerate();
            }
          }}
        />
      </div>
      {searchBarState.text.length > 0 && (
        <button
          onClick={() => void handleGenerate()}
          disabled={generateImage.isLoading}
          className={`bg-black px-8 text-gray-500 transition duration-300 hover:bg-black hover:text-white disabled:bg-black`}
        >
          Generate
        </button>
      )}
    </div>
  );
}
