/* eslint-disable @typescript-eslint/no-unused-vars */
import { BsSearch } from "react-icons/bs";
import { useAtom } from "jotai";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { generateImageSearchBarAtom } from "~/atoms/promptTextAtom";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { useEffect } from "react";
import { getTRPCValidationError } from "~/utils/getTRPCValidationError";
import { generatingImageAtom } from "~/atoms/generatingImageAtom";
import { GENERATE_IMAGE_COUNT } from "~/common/constants";

export interface InputSearchBarProps {
  afterGenerate?: () => void;
}

export default function GenerateImageSearchBar({
  afterGenerate,
}: InputSearchBarProps) {
  const isMediumBreakpoint = useMediaQuery("(min-width: 640px)");
  const [_, setGeneratingImage] = useAtom(generatingImageAtom);
  const generateImage = api.images.generateImage.useMutation();
  const apiContext = api.useContext();
  const [searchBarState, setSearchBarState] = useAtom(
    generateImageSearchBarAtom
  );

  useEffect(() => {
    if (isMediumBreakpoint) {
      // When the screen is small we remove all the newline in the current prompt to make it fit in one-line
      setSearchBarState((x) => ({ ...x, text: x.text.replace(/\n/g, " ") }));
    }
  }, [isMediumBreakpoint, setSearchBarState]);

  const handleGenerate = async () => {
    setSearchBarState((p) => ({ ...p, loading: true }));
    setGeneratingImage(GENERATE_IMAGE_COUNT);

    try {
      const result = await generateImage.mutateAsync({
        prompt: searchBarState.text,
      });
      setSearchBarState((p) => ({ ...p, text: "" }));
      await apiContext.images.getAll.invalidate();
      await apiContext.users.getTokenCount.invalidate();
      afterGenerate?.();
      console.log(result);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const trpcError = getTRPCValidationError(err);
      if (trpcError) {
        return toast.error(trpcError.message);
      }

      toast.error("Something went wrong");
    } finally {
      setSearchBarState((p) => ({ ...p, loading: false }));
      setGeneratingImage(0);
    }
  };

  return (
    <div
      className="flex w-full flex-col gap-3 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white 
      shadow-lg shadow-black/10 dark:border-violet-800/20 dark:bg-slate-900
    dark:text-white dark:shadow-black/30 sm:flex-row"
    >
      <div className="flex w-full flex-row gap-3 px-6 py-3 ">
        <BsSearch
          fontSize={22}
          className="text-gray-400/50 dark:text-violet-500"
        />
        <textarea
          id="generate-search-bar"
          className="w-full resize-none overflow-auto overflow-x-hidden whitespace-normal bg-transparent outline-none
          placeholder:italic dark:placeholder:text-violet-300 sm:overflow-hidden sm:whitespace-nowrap"
          rows={isMediumBreakpoint ? 1 : 4}
          placeholder="Generate or search..."
          value={searchBarState.text}
          disabled={generateImage.isLoading}
          onInput={(e) => {
            let newText = e.currentTarget.value;
            if (isMediumBreakpoint) {
              newText = newText.replace(/\n/g, " ");
            }
            setSearchBarState((p) => ({ ...p, text: newText }));
          }}
        ></textarea>
      </div>
      <button
        onClick={() => void handleGenerate()}
        disabled={generateImage.isLoading}
        className={`bg-black px-8 py-4 text-white transition duration-300   ${
          searchBarState.text.length > 0 ? "visible" : "sm:invisible"
        } 
          hover:bg-black hover:text-violet-400 disabled:bg-black sm:py-0`}
      >
        Generate
      </button>
    </div>
  );
}
