import Head from "next/head";
import { api } from "~/utils/api";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Image Generator</title>
      </Head>

      <div className="p-4">
        <h1>Hello Amigos</h1>
      </div>
    </div>
  );
}
