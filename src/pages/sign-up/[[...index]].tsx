import { SignUp, useUser } from "@clerk/nextjs";
import { ThreeDots } from "react-loader-spinner";
import Redirect from "~/components/Redirect";
import { dark } from "@clerk/themes";
import { useDarkMode } from "~/hooks/useDarkMode";

export default function Page() {
  const { isSignedIn, isLoaded } = useUser();
  const { isDark } = useDarkMode();

  if (!isLoaded) {
    return (
      <div className="flex w-full flex-row justify-center p-10 text-purple-500">
        <ThreeDots
          height="80"
          width="80"
          radius="9"
          color="rgb(168 85 247)"
          ariaLabel="loading"
        />
      </div>
    );
  }

  if (isSignedIn) {
    return <Redirect to="/gallery" />;
  }

  return (
    <div className="mt-10 flex flex-row items-center justify-center py-4">
      <SignUp
        appearance={{
          baseTheme: isDark ? dark : undefined,
          elements: {
            card: "dark:bg-slate-950 dark:text-white border dark:border-violet-400/30",
            footer: "hidden",
          },
          variables: {
            colorText: isDark ? "white" : undefined,
          },
        }}
      />
    </div>
  );
}
