/* eslint-disable @typescript-eslint/no-unused-vars */
import { BsSearch } from "react-icons/bs";
import { useAtom } from "jotai";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { generateImageSearchBarAtom } from "~/atoms/promptTextAtom";
import { useMediaQuery } from "~/hooks/useMediaQuery";
import { useCallback, useEffect } from "react";
import { getTRPCValidationError } from "~/utils/getTRPCValidationError";
import { generatingImageAtom } from "~/atoms/generatingImageAtom";
import { GENERATE_IMAGE_COUNT } from "~/common/constants";
import { AiFillStar } from "react-icons/ai";
import type { UseTRPCMutationResult } from "@trpc/react-query/shared";
import type { inferProcedureInput, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import type { TRPCClientErrorLike } from "@trpc/client";
import { ThreeDots } from "react-loader-spinner";

const MIN_IMPROVE_LENGTH = 200;

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

  const improvePromptMutation = api.images.improvePrompt.useMutation({
    onSuccess(newPrompt) {
      setSearchBarState((x) => ({ ...x, text: newPrompt }));
    },
  });

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

  const ImprovePrompt = useCallback(() => {
    const canImprove = searchBarState.text.trim().length < MIN_IMPROVE_LENGTH;

    if (searchBarState.text.trim().length === 0 || !canImprove) {
      return <></>;
    }

    return (
      <ImprovePromptButton
        prompt={searchBarState.text}
        mutation={improvePromptMutation}
      />
    );
  }, [improvePromptMutation, searchBarState.text]);

  return (
    <div
      className="flex w-full flex-col gap-3 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white 
      shadow-lg shadow-black/10 dark:border-violet-800/20 dark:bg-slate-900
    dark:text-white dark:shadow-black/30 md:flex-row"
    >
      <div className="relative flex w-full flex-col gap-3 overflow-hidden px-4 pb-1 pt-3 md:flex-row md:py-3 md:pl-6 md:pr-1">
        <div className="flex flex-row justify-between">
          <BsSearch
            fontSize={22}
            className="text-gray-400/50 dark:text-violet-500"
          />
          <div className="block md:hidden">
            <ImprovePrompt />
          </div>
        </div>
        <textarea
          id="generate-search-bar"
          className="w-full resize-none overflow-auto overflow-x-hidden whitespace-normal bg-transparent outline-none
          placeholder:italic dark:placeholder:text-violet-300 md:overflow-hidden md:whitespace-nowrap"
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

        <div className="hidden md:block">
          <ImprovePrompt />
        </div>
      </div>
      <button
        onClick={() => void handleGenerate()}
        disabled={generateImage.isLoading}
        className={`bg-black px-8 py-4 text-white transition duration-300   ${
          searchBarState.text.length > 0 ? "visible" : "md:invisible"
        } 
          hover:bg-black hover:text-violet-400 disabled:bg-black md:py-0`}
      >
        Generate
      </button>
    </div>
  );
}

type UseMutationImprovePromptResult = UseTRPCMutationResult<
  inferRouterOutputs<AppRouter>["images"]["improvePrompt"],
  TRPCClientErrorLike<AppRouter>,
  inferProcedureInput<AppRouter["images"]["improvePrompt"]>,
  unknown
>;

interface ImprovePromptButtonProps {
  prompt: string;
  mutation: UseMutationImprovePromptResult;
}

function ImprovePromptButton({ prompt, mutation }: ImprovePromptButtonProps) {
  const handleImprovePrompt = async () => {
    if (mutation.isLoading) {
      return;
    }

    try {
      await mutation.mutateAsync(
        { prompt },
        {
          onError(err) {
            toast.error(err.message);
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={handleImprovePrompt}
      className={`relative ml-auto flex max-h-10 flex-row items-center gap-1 rounded-lg border border-gray-300
px-2 py-1 text-xs text-gray-500 transition-all duration-300 hover:border-violet-500 hover:text-violet-600
dark:border-violet-300 dark:text-violet-200 dark:hover:border-violet-500 dark:hover:text-violet-600
`}
      style={{
        borderColor: mutation.isLoading ? "rgb(139 92 246)" : undefined,
      }}
    >
      <AiFillStar
        className={`mt-[2px] text-[14p] ${
          mutation.isLoading ? "opacity-0" : "animate-pulse"
        } `}
      />
      <span className={`${mutation.isLoading ? "opacity-0" : ""}`}>
        Improve
      </span>

      {mutation.isLoading && (
        <ThreeDots
          height="20"
          width="40"
          radius="9"
          color="rgb(124 58 237)"
          ariaLabel="loading"
          wrapperClass="absolute left-1/2 -translate-x-1/2"
        />
      )}
    </button>
  );
}
