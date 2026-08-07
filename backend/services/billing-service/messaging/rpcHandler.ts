import db from "../db/index.js";
import { userBilling } from "../db/schema.js";
import { eq, sql, and, gte } from "drizzle-orm";
import { DeductCoinsRequest, DeductCoinsResponse } from "../../../shared/messaging/types.js";
import { rpcRespond } from "../../../shared/messaging/rpc.js";

async function handleDeductCoins(payload: DeductCoinsRequest): Promise<DeductCoinsResponse> {
  try {
    const updatedBilling = await db
      .update(userBilling)
      .set({
        interviewCoins: sql`${userBilling.interviewCoins} - ${payload.amount}`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(userBilling.userId, payload.userId),
        gte(userBilling.interviewCoins, payload.amount)
      ))
      .returning();

    if (updatedBilling.length === 0) {
      return { success: false, error: "Not enough interview coins or user not found" };
    }

    return { success: true, message: "Coins deducted successfully" };
  } catch (error: any) {
    console.error("[RPC] Error deducting coins:", error);
    return { success: false, error: error.message };
  }
}

export async function startRpcResponder(): Promise<void> {
  await rpcRespond<DeductCoinsRequest, DeductCoinsResponse>("coins.deduct", handleDeductCoins);
}
