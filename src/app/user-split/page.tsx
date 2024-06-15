"use client"

import { api } from "$/src/trpc/react";
import { Button, Link } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

export default function Simple() {
    const [receiverWalletDetails, setReceiverWalletDetails] = useState("");
    const [receiverTwoWalletDetails, setReceiverTwoWalletDetails] = useState("");
    const [senderWalletDetails, setSenderWalletDetails] = useState("");
    const [incomingLink, setIncomingLink] = useState("");
    const [incomingLinkTwo, setIncomingLinkTwo] = useState("");
    const [redirectURL, setRerdirectURL] = useState("");
    const [interact_ref, setInteractRef] = useState("");

    const searchParams = useSearchParams();

    const receiverWallet = api.openPayments.getWalletDetails.useQuery(
        {
            walletAddress: "https://ilp.rafiki.money/f5320ec5",
        },
        { enabled: false }
    );

    const receiverTwoWallet = api.openPayments.getWalletDetails.useQuery(
        {
            walletAddress: "https://ilp.rafiki.money/us2",
        },
        { enabled: false }
    );

    const senderWallet = api.openPayments.getWalletDetails.useQuery(
        {
            walletAddress: "https://ilp.rafiki.money/my-euro",
        },
        { enabled: false }
    );

    const incomingPayment = api.openPayments.createIncomingPayment.useQuery(
        {
            walletAddress: senderWalletDetails,
            receiverAddress: receiverWalletDetails,
            value: "60",
        },
        { enabled: !!senderWalletDetails && !!receiverWalletDetails }
    );

    const incomingPaymentTwo = api.openPayments.createIncomingPayment.useQuery(
        {
            walletAddress: senderWalletDetails,
            receiverAddress: receiverTwoWalletDetails,
            value: "40",
        },
        { enabled: !!senderWalletDetails && !!receiverTwoWalletDetails }
    );

    const quote = api.openPayments.createQoute.useQuery(
        {
            walletAddress: senderWalletDetails,
            incomingPaymentUrl: incomingLink,
        },
        { enabled: !!senderWalletDetails && !!incomingLink }
    );

    const quoteTwo = api.openPayments.createQoute.useQuery(
        {
            walletAddress: senderWalletDetails,
            incomingPaymentUrl: incomingLinkTwo,
        },
        { enabled: !!senderWalletDetails && !!incomingLinkTwo }
    );

    const outgoingPaymentAuthorization = api.openPayments.getOutgoingPaymentAuthorization.useQuery(
      {
        walletAddress: senderWalletDetails,
        receiveAmount: {value: "100", assetCode: "USD", assetScale: 2},
        redirectUrl: "http://localhost:3000/simple"
      },
      { enabled: false },
    );

    const createOutgoingPayment = api.openPayments.createOutgoingPayment.useQuery(
        {
          interactRef:interact_ref,
        },
        { enabled: false },
      );

    async function makePayment(event: { preventDefault: () => void }) {
        event.preventDefault();

        const receiverDetails = await receiverWallet.refetch();
        setReceiverWalletDetails(receiverDetails.data?.data.id ?? "");

        const receiverTwoDetails = await receiverTwoWallet.refetch();
        setReceiverTwoWalletDetails(receiverTwoDetails.data?.data.id ?? "");

        const senderDetails = await senderWallet.refetch();
        setSenderWalletDetails(senderDetails.data?.data.id ?? "");
    }

    useEffect(() => {
        setInteractRef(searchParams.get("interact_ref") ?? "Undefined");
    }, []);

    useEffect(() => {
        createOutgoingPayment.refetch();
    }, [interact_ref])

    useEffect(() => {
        if (senderWalletDetails && receiverWalletDetails) {
            incomingPayment.refetch().then((result) => {
                setIncomingLink(result.data?.data.id ?? "");
            });
        }
    }, [senderWalletDetails, receiverWalletDetails]);

    useEffect(() => {
        if (senderWalletDetails && receiverTwoWalletDetails) {
            incomingPaymentTwo.refetch().then((result) => {
                setIncomingLinkTwo(result.data?.data.id ?? "");
                outgoingPaymentAuthorization.refetch().then((result) => {
                    setRerdirectURL(result.data?.data.interact?.redirect ?? "undefined")
                });
            });
        }
    }, [senderWalletDetails, receiverTwoWalletDetails]);

    useEffect(() => {
        if (incomingLink) {
            quote.refetch();
        }
        if (incomingLinkTwo) {
            quoteTwo.refetch();
        }
    }, [incomingLink, incomingLinkTwo]);
;


    return (
        <form
            onSubmit={makePayment}
            className="col-span-6 flex flex-col md:col-span-8"
        >
            <Button
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="solid"
                color="primary"
                type="submit"
            >
                Make a Payment :)
            </Button>
            <br />
            {redirectURL && (
                <span className="flex flex-col items-center pt-2 font-bold">
                      <Button
                        as={Link}
                        className="col col-span-1 justify-start"
                        variant="solid"
                        color="warning"
                        href={
                          outgoingPaymentAuthorization.data?.data.interact
                            ?.redirect
                        }
                      >
                        <FaLock size={15} />
                        Authorize Outgoing Payment
                      </Button>
                </span>
            )}
        </form>
    );
}
