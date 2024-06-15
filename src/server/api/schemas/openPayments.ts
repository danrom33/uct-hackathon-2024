import { z } from "zod";

const valueSchema = z.object({
  value: z.string(),
  assetCode: z.string(),
  assetScale: z.number(),
});

export const opAuthSchema = z.object({
  walletAddress: z.string(),
  qouteId: z.string().optional(),
  debitAmount: valueSchema.optional(),
  receiveAmount: valueSchema,
  redirectUrl: z.string(),
});

export const opCreateSchema = z.object({
  walletAddress: z.string().optional(),
  continueAccessToken: z.string().optional(),
  qouteId: z.string().optional(),
  interactRef: z.string(),
  continueUri: z.string().optional(),
});

export type OPAuthSchema = z.infer<typeof opAuthSchema>;
export type OPCreateSchema = z.infer<typeof opCreateSchema>;
