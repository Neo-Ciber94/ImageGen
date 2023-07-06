import { SignUp, useUser } from "@clerk/nextjs";
import Redirect from "~/components/Redirect";

export default function Page() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <Redirect to="/gallery" />;
  }

  return <SignUp />;
}
