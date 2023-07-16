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
        timeout: '1 minute',
        environment: {
          ...env
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });

    app.setDefaultFunctionProps({
      logRetention: 'one_week',
    })
  },
} satisfies SSTConfig;
