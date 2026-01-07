/**
 * Placeholder Image API Route
 * 
 * Generates simple placeholder images for development.
 * Usage: /api/placeholder/width/height
 * Example: /api/placeholder/80/80
 */

import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // params will be { params: ['80', '80'] } for /api/placeholder/80/80
    const routeParams = params?.params || [];
    const [width = 80, height = 80] = routeParams;

    const w = parseInt(width, 10) || 80;
    const h = parseInt(height, 10) || 80;

    // Validate dimensions
    if (w > 1000 || h > 1000) {
      return NextResponse.json(
        { error: "Dimensions too large. Maximum is 1000x1000" },
        { status: 400 }
      );
    }

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${w}" height="${h}" fill="#1a1a1a"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="${Math.min(w, h) / 4}" 
          fill="#666" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          ${w}×${h}
        </text>
      </svg>
    `.trim();

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Placeholder image error:", error);
    return NextResponse.json(
      { error: "Failed to generate placeholder" },
      { status: 500 }
    );
  }
}

