import { authMiddleware } from "@clerk/nextjs";
export default authMiddleware({
    publicRoutes: ["/", "/signup"]
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};