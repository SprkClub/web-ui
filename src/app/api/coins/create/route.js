/**
 * Create Coin API Route
 * 
 * This endpoint creates a new coin pool by calling the external API
 * POST /api/coins/create
 */

import { NextResponse } from "next/server";

const API_URL = process.env.COIN_API_URL || "http://72.61.171.27:3001";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      wallet,
      config,
      name,
      symbol,
      uri,
      cluster = "MAINNET",
    } = body;

    // Validate required fields
    if (!wallet || !name || !symbol || !uri) {
      return NextResponse.json(
        { error: "Missing required fields: wallet, name, symbol, uri" },
        { status: 400 }
      );
    }

    console.log("[create-coin] Calling external API:", {
      wallet: wallet.substring(0, 10) + "...",
      name,
      symbol,
      cluster,
    });

    // Call external API to get pool instructions
    const response = await fetch(`${API_URL}/api/create-pool`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet,
        config: config || "31YCnMxsNH5JXoz36wB5Xt2oRC2LHjMyKbwt4gwrFPXW", // Default config
        name,
        symbol,
        uri,
        cluster,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[create-coin] API Error:", error);
      return NextResponse.json(
        { error: error.error || "Failed to create pool" },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "API request failed" },
        { status: 500 }
      );
    }

    console.log("[create-coin] Pool instructions received successfully");

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[create-coin] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

