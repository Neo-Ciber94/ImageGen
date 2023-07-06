import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const imagesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ }) => {
    // const images = Array<string>(21).fill("https://placehold.co/256x256");
    const images: string[] = [];
    return images;
  })
});
