import { type SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";
import { env } from "~/env.mjs";

export default {
  config(_input) {
    return {
      name: "ImageGen",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "ImageGenSite", {
        environment: {
          ...env,
          SERVER_URL: "https://du8ecttu3enax.cloudfront.net"
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
