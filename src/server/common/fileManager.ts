import { S3Client, PutObjectCommand, type PutObjectCommandOutput, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_KEY,
    },
})

export interface UploadFilesOptions {
    metadata?: Record<string, string>;
}

export async function uploadFiles(contentToUpload: Blob[], opts: UploadFilesOptions = {}) {
    const uploadFilePromises: Promise<{ key: string }>[] = [];

    for (const blob of contentToUpload) {
        const uploadFile = async () => {
            // we take the last part of the mime type: image/jpg
            const ext = blob.type.split('/')[1];

            if (ext == null) {
                throw new Error("File extension cannot be found");
            }

            const imageId = nanoid();
            const key = `${imageId}.${ext}`;
            const buffer = new Uint8Array(await blob.arrayBuffer());

            const command = new PutObjectCommand({
                Bucket: env.AWS_BUCKET_NAME,
                Key: key,
                ContentType: blob.type,
                Body: buffer,
                Metadata: opts.metadata,
            });

            try {
                const result: PutObjectCommandOutput = await s3Client.send(command);
                console.log("File uploaded: ", result);
                return { key };
            }
            catch (err) {
                const filename = blob.name ?? "[unnamed]";
                console.error(`Failed to upload file with key '${key}': '${filename}'`, err);
                throw err;
            }
        }

        uploadFilePromises.push(uploadFile());
    }

    const result = await Promise.all(uploadFilePromises);
    const urls = result.map(({ key }) => {
        const url = new URL(getImageUrl(key))
        return { url, key };
    });

    console.log(`${urls.length} files uploaded successfully`, urls);
    return urls;
}

export async function deleteFile(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
}

// host:image-gen-generated-images.s3.us-east-1.amazonaws.com
export function getImageUrl(key: string) {
    return `https://${env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`
}