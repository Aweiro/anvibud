"use server";

import { createProduct } from "@/services/product.service";
import { uploadImage } from "@/services/cloudinary.service";
import { revalidatePath } from "next/cache";

export async function submitProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const name_uk = formData.get("name_uk") as string;
    const name_ru = formData.get("name_ru") as string;
    const name_pl = formData.get("name_pl") as string;

    const slug = formData.get("slug") as string;

    const description = formData.get("description") as string;
    const description_uk = formData.get("description_uk") as string;
    const description_ru = formData.get("description_ru") as string;
    const description_pl = formData.get("description_pl") as string;
    const priceStr = formData.get("price") as string;
    const salePriceStr = formData.get("salePrice") as string;
    const stockStr = formData.get("stock") as string;
    const subcategoryId = formData.get("subcategoryId") as string;
    const sizesStr = formData.get("sizes") as string;
    const brand = formData.get("brand") as string;
    const isCustomOrder = formData.get("isCustomOrder") === "on";
    const label = (formData.get("label") as any) || null;
    const specificationsStr = formData.get("specifications") as string;
    const specifications = specificationsStr ? JSON.parse(specificationsStr) : [];

    const files = formData.getAll("images") as File[];
    const imageUrls: string[] = [];

    // Upload files to cloudinary
    for (const file of files) {
      if (file && file.size > 0) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }
    }

    const price = parseFloat(priceStr || "0");
    const salePrice = salePriceStr ? parseFloat(salePriceStr) : null;
    const stock = parseInt(stockStr || "0", 10);

    let discountAmount = 0;

    if (salePrice !== null && salePrice < price) {
      discountAmount = price - salePrice;
    }
    const sizes = sizesStr ? sizesStr.split(",").map(s => s.trim()).filter(Boolean) : [];

    await createProduct({
      name,
      name_uk,
      name_ru,
      name_pl,
      slug,
      description,
      description_uk,
      description_ru,
      description_pl,
      price,
      stock,
      discountAmount,
      subcategoryId,
      images: imageUrls,
      sizes,
      brand,
      isCustomOrder,
      label,
      specifications,
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);

    // Prisma Unique Constraint code
    if (error.code === "P2002") {
      return { success: false, error: "A product with this Slug already exists. Please choose a different one." };
    }

    return { success: false, error: error.message };
  }
}

export async function editProductAction(id: string, formData: FormData, existingImages: string[]) {
  try {
    const name = formData.get("name") as string;
    const name_uk = formData.get("name_uk") as string;
    const name_ru = formData.get("name_ru") as string;
    const name_pl = formData.get("name_pl") as string;

    const slug = formData.get("slug") as string;

    const description = formData.get("description") as string;
    const description_uk = formData.get("description_uk") as string;
    const description_ru = formData.get("description_ru") as string;
    const description_pl = formData.get("description_pl") as string;
    const priceStr = formData.get("price") as string;
    const salePriceStr = formData.get("salePrice") as string;
    const stockStr = formData.get("stock") as string;
    const subcategoryId = formData.get("subcategoryId") as string;
    const sizesStr = formData.get("sizes") as string;
    const brand = formData.get("brand") as string;
    const isCustomOrder = formData.get("isCustomOrder") === "on";
    const label = (formData.get("label") as any) || null;
    const specificationsStr = formData.get("specifications") as string;
    const specifications = specificationsStr ? JSON.parse(specificationsStr) : [];

    const files = formData.getAll("images") as File[];
    const uploadedImageUrls: string[] = [];

    // Upload new files to cloudinary
    for (const file of files) {
      if (file && file.size > 0) {
        const url = await uploadImage(file);
        uploadedImageUrls.push(url);
      }
    }

    const price = parseFloat(priceStr || "0");
    const salePrice = salePriceStr ? parseFloat(salePriceStr) : null;
    const stock = parseInt(stockStr || "0", 10);

    let discountAmount = 0;

    if (salePrice !== null && salePrice < price) {
      discountAmount = price - salePrice;
    }
    const sizes = sizesStr ? sizesStr.split(",").map(s => s.trim()).filter(Boolean) : [];

    const { prisma } = await import("@/lib/prisma"); // direct fallback import for actions

    await prisma.product.update({
      where: { id },
      data: {
        name,
        name_uk,
        name_ru,
        name_pl,
        slug,
        description,
        description_uk,
        description_ru,
        description_pl,
        price,
        stock,
        discountAmount,
        subcategory: { connect: { id: subcategoryId } },
        images: [...existingImages, ...uploadedImageUrls],
        sizes,
        brand,
        isCustomOrder,
        label,
        specifications,
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating product:", error);
    if (error.code === "P2002") {
      return { success: false, error: "A product with this Slug already exists." };
    }
    return { success: false, error: error.message };
  }
}
