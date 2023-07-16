import "~/styles/globals.css";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import Layout from "~/layout/Layout";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { NextSeo } from "next-seo";

// This should be more dynamic
const SITE_URL = "https://du8ecttu3enax.cloudfront.net";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <NextSeo
        defaultTitle="ImageGen"
        titleTemplate="ImageGen | %s"
        description="An AI image generator gallery"
        openGraph={{
          type: "website",
          title: "ImageGen",
          description: "An AI image generator gallery",
          url: SITE_URL,
          images: [
            {
              url: `${SITE_URL}/icons/icon-512x512.png`,
              width: 512,
              height: 512,
              alt: "ImageGen",
            },
            {
              url: `${SITE_URL}/icons/icon-128x128.png`,
              width: 128,
              height: 128,
              alt: "ImageGen",
            },
          ],
        }}
        twitter={{
          cardType: "summary_large_image",
          site: SITE_URL,
        }}
        additionalLinkTags={[
          {
            rel: "manifest",
            href: "/manifest.json",
          },
        ]}
      />

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
