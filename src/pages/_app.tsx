import "~/styles/globals.css";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import Layout from "~/layout/Layout";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>ImageGen</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `body.dark {
            background: rgb(2 6 23)
          }`,
          }}
        ></style>
      </Head>
      <ClerkProvider {...pageProps}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
