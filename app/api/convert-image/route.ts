import { NextRequest, NextResponse } from "next/server";

// Note: Image conversion is handled client-side for better performance
// This API route can be used for server-side processing if needed
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = formData.get("format") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // For now, return the file as-is
    // In production, you could use sharp or other image processing libraries
    const buffer = await file.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename=converted.${format}`,
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert image" },
      { status: 500 }
    );
  }
}

