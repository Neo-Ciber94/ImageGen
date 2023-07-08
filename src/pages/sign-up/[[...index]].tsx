import { SignUp, useUser } from "@clerk/nextjs";
import Redirect from "~/components/Redirect";

export default function Page() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <p className="p-4 text-purple-500">Loading...</p>;
  }

  if (isSignedIn) {
    return <Redirect to="/gallery" />;
  }

  return <SignUp redirectUrl={window.location.origin} />;
}
