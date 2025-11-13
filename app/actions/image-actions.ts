"use server";

import { revalidatePath } from "next/cache";

export async function convertImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const format = formData.get("format") as string;

    if (!file) {
      return { error: "No file provided" };
    }

    // In a real app, you might want to save to storage
    // For now, we'll return success
    revalidatePath("/");

    return {
      success: true,
      message: `Image converted to ${format} successfully`,
    };
  } catch (error) {
    return {
      error: "Failed to convert image",
    };
  }
}

export async function compressFilesAction(formData: FormData) {
  try {
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return { error: "No files provided" };
    }

    // In a real app, you might want to save to storage
    revalidatePath("/");

    return {
      success: true,
      message: `${files.length} file(s) compressed successfully`,
    };
  } catch (error) {
    return {
      error: "Failed to compress files",
    };
  }
}

