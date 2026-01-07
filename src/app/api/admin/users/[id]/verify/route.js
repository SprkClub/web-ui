import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/adminMiddleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(request, { params }) {
  try {
    // Check if user is admin
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
        Authorization: `Bearer ${request.cookies.get("auth-token")?.value || ""}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify user" },
      { status: 500 }
    );
  }
}

