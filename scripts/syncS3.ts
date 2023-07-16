import { S3Client, ListObjectsCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3"
import { generatedImages } from "drizzle/schema"
import { env } from "~/env.mjs"
import { db } from "~/server/db/drizzle"

// Run with: npx dotenv-cli -e .env -v NODE_ENV=development -- npx tsx .\private\syncS3.ts

/**
 * This script is used to synchronize the s3 objects with the database in case some objects
 * exists in S3 what were not added to the database. We should also do the reverse
 * and delete records in the database that do not exists in s3.
 * 
 * Why you need this?
 * 
 * Currently the system do not reverse and deleted uploaded items if an error occurs after
 * like a function timeout or other error, so we need to delete those files from the file handler.
 */

const s3Client = new S3Client({
    credentials: {
        accessKeyId: env.MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: env.MY_AWS_SECRET_KEY,
    },
})

console.log("Synchronizing s3 with database");

async function main() {
    const images = await db.select().from(generatedImages);
    console.log(`${images.length} generated images images`);

    const s3Images = await s3Client.send(new ListObjectsCommand({
        Bucket: env.MY_AWS_BUCKET_NAME,
    }));

    const objects = s3Images.Contents || [];

    console.log(`${objects.length} objects found on the s3 bucket`);

    const keyToDelete: string[] = [];
    for (const object of objects) {
        const objectKey = object.Key;
        const exists = images.some(img => img.key === objectKey);

        if (exists || objectKey == null) {
            continue;
        }

        keyToDelete.push(objectKey);
    }

    if (keyToDelete.length === 0) {
        console.log("no objects to delete");
        return;
    }

    console.log(keyToDelete);
    console.log(`${keyToDelete.length} objects to be deleted`);

    await s3Client.send(new DeleteObjectsCommand({
        Bucket: env.MY_AWS_BUCKET_NAME,
        Delete: {
            Objects: keyToDelete.map(Key => ({ Key }))
        }
    }))

    console.log(`${keyToDelete.length} s3 objects were successfully deleted`);
}

main().catch(console.error)