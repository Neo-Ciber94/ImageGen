import "~/styles/globals.css";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import Layout from "~/layout/Layout";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
