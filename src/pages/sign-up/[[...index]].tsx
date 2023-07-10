import { SignUp, useUser } from "@clerk/nextjs";
import { ThreeDots } from "react-loader-spinner";
import Redirect from "~/components/Redirect";

export default function Page() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    <p className="flex w-full flex-row justify-center p-10 text-purple-500">
      <ThreeDots
        height="80"
        width="80"
        radius="9"
        color="rgb(168 85 247)"
        ariaLabel="loading"
      />
    </p>;
  }

  if (isSignedIn) {
    return <Redirect to="/gallery" />;
  }

  return <SignUp redirectUrl={window.location.origin} />;
}
