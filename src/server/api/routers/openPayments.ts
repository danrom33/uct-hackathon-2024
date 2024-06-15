import { createTRPCRouter, publicProcedure } from "$/src/server/api/trpc";
import { type Response } from "$/src/utils/types";
import { z } from "zod";
import {
  createIncomingPayment,
  createOutgoingPayment,
  createQoute,
  getAuthenticatedClient,
  getOutgoingPaymentAuthorization,
  getWalletAddressInfo,
} from "../../helpers/open-payments";
import { opAuthSchema, opCreateSchema } from "../schemas/openPayments";
import { Grant, GrantContinuation, isFinalizedGrant } from "@interledger/open-payments";


let pendingPayments:
{
  walletAddress: string,
  continue_access_token: string,
  continue_uri: string,
  interact_ref: string
  paymentDetails: {
    incomingPaymentId: string,
    quoteId: string
    debitAmount:
    {
      value: string;
      assetCode: string;
      assetScale: number;
    }
  }[]
}[] = [];

let mostRecentUser : string = "";





export const openPaymentsRouter = createTRPCRouter({
  getWalletDetails: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const response: Response = {
        success: true,
        message: "wallet details obtained",
        data: {},
      };

      // Initialize Open Payments client
      const client = await getAuthenticatedClient();

      const [walletAddress, walletAddressDetails] = await getWalletAddressInfo(
        client,
        input.walletAddress,
      );

      return { ...response, ...{ data: walletAddressDetails } };
    }),

  createIncomingPayment: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        receiverAddress: z.string(),
        value: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const response: Response = {
        success: true,
        message: "incoming payment created",
        data: {},
      };
      // Initialize Open Payments client
      const client = await getAuthenticatedClient();

      // get wallet details
      const [walletAddress, walletAddressDetails] = await getWalletAddressInfo(
        client,
        input.receiverAddress,
      );

      console.log("** 1 inc");

      // create incoming payment
      const incomingPayment = await createIncomingPayment(
        client,
        input.value,
        walletAddressDetails,
      );

      

      let userExists = false;
      let userID = -1;

      for(let i = 0; i < pendingPayments.length; ++i){
        if(pendingPayments[i]?.walletAddress === input.walletAddress){
          userExists = true;
          userID = i;
        }
      }

      if(userExists){
        pendingPayments[userID]?.paymentDetails.push({
          incomingPaymentId: incomingPayment.id,
          debitAmount: incomingPayment.incomingAmount ?? {value: "0", assetCode: "USD", assetScale: 2},
          quoteId: ""
        })
      } 
      else{
        pendingPayments.push({
          walletAddress: input.walletAddress,
          continue_access_token: "",
          continue_uri: "",
          interact_ref: "",
          paymentDetails: []
        });
        pendingPayments[pendingPayments.length-1]?.paymentDetails.push({
          incomingPaymentId: incomingPayment.id,
          debitAmount: incomingPayment.incomingAmount ?? {value: "0", assetCode: "USD", assetScale: 2},
          quoteId: ""
        })
      }


      return { ...response, ...{ data: incomingPayment } };
    }),

  createQoute: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        incomingPaymentUrl: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const response: Response = {
        success: true,
        message: "qoute created",
        data: {},
      };

      // Initialize Open Payments client
      const client = await getAuthenticatedClient();

      // get wallet details
      const [walletAddress, walletAddressDetails] = await getWalletAddressInfo(
        client,
        input.walletAddress,
      );

      console.log("** 1 inc");

      // create qoute
      const qoute = await createQoute(
        client,
        input.incomingPaymentUrl,
        walletAddressDetails,
      );

      for(let i = 0; i < pendingPayments.length; ++i){
        if(pendingPayments[i]?.walletAddress === input.walletAddress){
          console.log("CORRESPONDING WALLET ADDRESS FOUND (FOR QUOTE)");
          console.log(pendingPayments[i]?.walletAddress);
          for(let j = 0; j < pendingPayments[i]?.paymentDetails.length; ++j){
            if(pendingPayments[i]?.paymentDetails[j]?.incomingPaymentId === input.incomingPaymentUrl){
              console.log("CORRESPONDING INCOMING PAYMENT FOUND (FOR QUOTE)");
              pendingPayments[i].paymentDetails[j].quoteId = qoute.id;
            }
          }
        }
      }
      return { ...response, ...{ data: qoute } };
    }),
 
  getOutgoingPaymentAuthorization: publicProcedure
    .input(opAuthSchema)
    .query(async ({ input }) => {
      const response: Response = {
        success: true,
        message: "wallet details obtained",
        data: {},
      };

      // Initialize Open Payments client
      const client = await getAuthenticatedClient();

      // get wallet details
      const [walletAddress, walletAddressDetails] = await getWalletAddressInfo(
        client,
        input.walletAddress,
      );

      // create outgoing authorization grant
      const outgoingPaymentAuthorization =
        await getOutgoingPaymentAuthorization(
          client,
          input,
          walletAddressDetails,
        );

        for(let i = 0; i < pendingPayments.length; ++i){
          if(pendingPayments[i]?.walletAddress === input.walletAddress){
            pendingPayments[i].continue_access_token = outgoingPaymentAuthorization.continue.access_token.value;
            pendingPayments[i].continue_uri = outgoingPaymentAuthorization.continue.uri;
          }
        }
        
        mostRecentUser = input.walletAddress;
        console.log("MOST RECENT USER IS " + mostRecentUser);


      return { ...response, ...{ data: outgoingPaymentAuthorization } };
    }),

  createOutgoingPayment: publicProcedure
    .input(opCreateSchema)
    .query(async ({ input }) => {
      const response: Response = {
        success: true,
        message: "outgoing payment created",
        data: {},
      };

      console.log("** ou");
      // Initialize Open Payments client
      const client = await getAuthenticatedClient();

      for(let i = 0; i < pendingPayments.length; ++i){
        if(pendingPayments[i]?.walletAddress === mostRecentUser){
            pendingPayments[i].interact_ref = input.interactRef;
            console.log(pendingPayments[i]);

            const grant = await client.grant.continue(
              {
                accessToken: pendingPayments[i]?.continue_access_token ?? "accessTokenUndefined",
                url: pendingPayments[i]?.continue_uri ?? "URLUndefined",
              },
              {
                interact_ref: pendingPayments[i]?.interact_ref,
              },
            );
        
        
          if (!isFinalizedGrant(grant)) {
            throw new Error(
              "Expected finalized grant. Probably the interaction from the previous script was not accepted, or the grant was already used."
            );
          }

          let token = grant.access_token;
          for(let j = 0; j < pendingPayments[i]?.paymentDetails.length; ++j){
            const outgoingPaymentResponse = await createOutgoingPayment(
              client,
              pendingPayments[i]?.paymentDetails[j].quoteId ?? "undefined",
              token.value,
              pendingPayments[i].walletAddress ?? ""
            );
            const new_token = await client.token.rotate({
              url: grant.access_token.manage,
              accessToken: grant.access_token.value
            });
            token = new_token.access_token;
          }
        }
      }
      // create outgoing authorization grant

      
        // console.log("LOOP INFO: " + incomingPaymentIds[i] + "\n" + debitAmounts[i].value + "\n" + OPWalletAddress + "\n")

      return { ...response };
    }),
});
