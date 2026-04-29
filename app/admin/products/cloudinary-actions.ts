"use server";

import { v2 as cloudinary } from "cloudinary";

export async function getCloudinarySignature() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp: timestamp,
            folder: process.env.CLOUDINARY_FOLDER ?? "products",
        },
        process.env.CLOUDINARY_API_SECRET!
    );

    return {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: process.env.CLOUDINARY_FOLDER ?? "products",
    };
}
