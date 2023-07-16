
/**
 * Number of images to generate per request.
 */
export const GENERATE_IMAGE_COUNT = 1;

/**
 * Size in pixels of a generated image.
 */
export const GENERATED_IMAGE_SIZE = 512;

/**
 * The size of the image to generate.
 */
export const GENERATE_IMAGE_SIZE = `${GENERATED_IMAGE_SIZE}x${GENERATED_IMAGE_SIZE}` as const;

/**
 * Max length of the prompt. at the given date the max length is 1000 words.
 * @see https://platform.openai.com/docs/api-reference/images
 */
export const MAX_PROMPT_LENGTH = 800;
