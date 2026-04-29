"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/services/cloudinary.service";

export async function createCategory(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const imageFile = formData.get("image") as File | null;

        if (!name || !slug) throw new Error("Name and Slug are required.");

        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImage(imageFile);
        }

        await prisma.category.create({
            data: {
                name,
                name_uk: (formData.get("name_uk") as string) || null,
                name_ru: (formData.get("name_ru") as string) || null,
                name_pl: (formData.get("name_pl") as string) || null,
                slug,
                image: imageUrl,
            },
        });

        revalidatePath("/admin/categories");
        revalidatePath("/admin/products/create"); // Revalidate products form to show new category
        revalidatePath("/"); // Storefront
        return { success: true };
    } catch (error: any) {
        console.error("Error creating category:", error);
        return { success: false, error: error.message };
    }
}

export async function createSubcategory(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const categoryId = formData.get("categoryId") as string;
        const imageFile = formData.get("image") as File | null;

        if (!name || !slug || !categoryId) {
            throw new Error("Name, Slug, and Category are required.");
        }

        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImage(imageFile);
        }

        await prisma.subcategory.create({
            data: {
                name,
                name_uk: (formData.get("name_uk") as string) || null,
                name_ru: (formData.get("name_ru") as string) || null,
                name_pl: (formData.get("name_pl") as string) || null,
                slug,
                image: imageUrl,
                category: { connect: { id: categoryId } },
            },
        });

        revalidatePath("/admin/categories");
        revalidatePath("/admin/products/create"); // Revalidate products form
        return { success: true };
    } catch (error: any) {
        console.error("Error creating subcategory:", error);
        return { success: false, error: error.message };
    }
}

export async function updateCategory(id: string, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const imageFile = formData.get("image") as File | null;

        if (!name || !slug) throw new Error("Name and Slug are required.");

        let dataToUpdate: any = {
            name,
            name_uk: (formData.get("name_uk") as string) || null,
            name_ru: (formData.get("name_ru") as string) || null,
            name_pl: (formData.get("name_pl") as string) || null,
            slug
        };

        if (imageFile && imageFile.size > 0) {
            const imageUrl = await uploadImage(imageFile);
            dataToUpdate.image = imageUrl;
        }

        await prisma.category.update({
            where: { id },
            data: dataToUpdate,
        });

        revalidatePath("/admin/categories");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating category:", error);
        if (error.code === "P2002") {
            return { success: false, error: "A category with this Slug already exists." };
        }
        return { success: false, error: error.message };
    }
}

export async function updateSubcategory(id: string, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const categoryId = formData.get("categoryId") as string;
        const imageFile = formData.get("image") as File | null;

        if (!name || !slug || !categoryId) {
            throw new Error("Name, Slug, and Category are required.");
        }

        let dataToUpdate: any = {
            name,
            name_uk: (formData.get("name_uk") as string) || null,
            name_ru: (formData.get("name_ru") as string) || null,
            name_pl: (formData.get("name_pl") as string) || null,
            slug,
            category: { connect: { id: categoryId } },
        };

        if (imageFile && imageFile.size > 0) {
            const imageUrl = await uploadImage(imageFile);
            dataToUpdate.image = imageUrl;
        }

        await prisma.subcategory.update({
            where: { id },
            data: dataToUpdate,
        });

        revalidatePath("/admin/categories");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating subcategory:", error);
        if (error.code === "P2002") {
            return { success: false, error: "A subcategory with this Slug already exists." };
        }
        return { success: false, error: error.message };
    }
}
