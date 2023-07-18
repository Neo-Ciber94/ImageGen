import { useRouter } from "next/router";
import { useScrollRestoration } from "~/hooks/useScrollRestoration";

export default function ScrollRestoration() {
  const router = useRouter();
  useScrollRestoration(router);
  return <></>;
}
