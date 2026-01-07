/**
 * Create Coin Transaction API Route
 * 
 * This endpoint creates and signs the transaction for coin creation
 * POST /api/coins/create-transaction
 */

import { NextResponse } from "next/server";
import {
  Connection,
  VersionedTransaction,
  TransactionMessage,
  Keypair,
} from "@solana/web3.js";
import bs58 from "bs58";

const API_URL = process.env.COIN_API_URL || "http://72.61.171.27:3001";
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      walletAddress,
      name,
      symbol,
      uri,
      cluster = "MAINNET",
      signedTransaction, // Client-signed transaction (partial)
    } = body;

    // Validate required fields
    if (!walletAddress || !name || !symbol || !uri) {
      return NextResponse.json(
        { error: "Missing required fields: walletAddress, name, symbol, uri" },
        { status: 400 }
      );
    }

    console.log("[create-transaction] Creating coin transaction:", {
      wallet: walletAddress.substring(0, 10) + "...",
      name,
      symbol,
      cluster,
    });

    // Step 1: Get pool instructions from API
    const response = await fetch(`${API_URL}/api/create-pool`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: walletAddress,
        config: "31YCnMxsNH5JXoz36wB5Xt2oRC2LHjMyKbwt4gwrFPXW", // Default config
        name,
        symbol,
        uri,
        cluster,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[create-transaction] API Error:", error);
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

    // Step 2: Reconstruct baseMint keypair
    const baseMint = Keypair.fromSecretKey(
      Uint8Array.from(result.data.baseMint.secretKey)
    );

    // Step 3: Deserialize instructions
    const { PublicKey, TransactionInstruction } = await import("@solana/web3.js");
    const connection = new Connection(RPC_URL, "confirmed");

    const instructions = result.data.instructions.map((serialized) => {
      return new TransactionInstruction({
        programId: new PublicKey(serialized.programId),
        keys: serialized.keys.map((key) => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        data: Buffer.from(serialized.data),
      });
    });

    // Step 4: Build versioned transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(walletAddress),
      recentBlockhash: blockhash,
      instructions: instructions,
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(messageV0);

    // Step 5: Sign with baseMint (server-side)
    versionedTransaction.sign([baseMint]);

    // Step 6: Serialize transaction for client to sign with wallet
    const serializedTransaction = Buffer.from(versionedTransaction.serialize()).toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        transaction: serializedTransaction,
        baseMint: baseMint.publicKey.toString(),
        blockhash,
        lastValidBlockHeight,
      },
    });
  } catch (error) {
    console.error("[create-transaction] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

