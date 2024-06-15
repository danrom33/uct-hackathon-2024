"use client"

import { api } from "$/src/trpc/react";
import { Button, Link } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import ProductList from "../_components/ProductList/productlist";

export default function Simple() {
    const [receiverWalletDetails, setReceiverWalletDetails] = useState("");
    const [receiverTwoWalletDetails, setReceiverTwoWalletDetails] = useState("");
    const [senderWalletDetails, setSenderWalletDetails] = useState("");
    const [senderWalletDetailsTwo, setSenderWalletDetailsTwo] = useState("");
    const [incomingLink, setIncomingLink] = useState("");
    const [incomingLinkTwo, setIncomingLinkTwo] = useState("");
    const [incomingLinkSenderTwo, setIncomingLinkSenderTwo] = useState("");
    const [incomingLinkSenderTwoTwo, setIncomingLinkSenderTwoTwo] = useState("");
    const [redirectURL, setRerdirectURL] = useState("");
    const [redirectURLTwo, setRerdirectURLTwo] = useState("");
    const [interact_ref, setInteractRef] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleSelectProduct = (product) => {
        setSelectedProducts([...selectedProducts, product]);
    };

    const searchParams = useSearchParams();

    const products = [
        {
          id: 1,
          name: 'Product 1',
          price: 100,
          image: '/product1.jpg'
        }
      ];

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

    const senderWalletTwo = api.openPayments.getWalletDetails.useQuery(
        {
            walletAddress: "https://ilp.rafiki.money/your-euro",
        },
        { enabled: false }
    );

    const incomingPaymentSenderOne = api.openPayments.createIncomingPayment.useQuery(
        {
            walletAddress: senderWalletDetails,
            receiverAddress: receiverWalletDetails,
            value: "" + (parseInt("6000")/2)
        },
        { enabled: !!senderWalletDetails && !!receiverWalletDetails }
    );

    const incomingPaymentSenderOneTwo = api.openPayments.createIncomingPayment.useQuery(
        {
            walletAddress: senderWalletDetails,
            receiverAddress: receiverTwoWalletDetails,
            value: "" + (parseInt("4000")/2)
        },
        { enabled: !!senderWalletDetails && !!receiverTwoWalletDetails }
    );

    const incomingPaymentSenderTwo = api.openPayments.createIncomingPayment.useQuery(
        {
            walletAddress: senderWalletDetailsTwo,
            receiverAddress: receiverWalletDetails,
            value: "" + (parseInt("6000")/2)
        },
        { enabled: !!senderWalletDetails && !!receiverWalletDetails }
    );

    const incomingPaymentSenderTwoTwo = api.openPayments.createIncomingPayment.useQuery(
        {
            walletAddress: senderWalletDetailsTwo,
            receiverAddress: receiverTwoWalletDetails,
            value: "" + (parseInt("4000")/2)
        },
        { enabled: !!senderWalletDetails && !!receiverTwoWalletDetails }
    );

    const quoteSenderOne = api.openPayments.createQoute.useQuery(
        {
            walletAddress: senderWalletDetails,
            incomingPaymentUrl: incomingLink,
        },
        { enabled: !!senderWalletDetails && !!incomingLink }
    );

    const quoteSenderOneTwo = api.openPayments.createQoute.useQuery(
        {
            walletAddress: senderWalletDetails,
            incomingPaymentUrl: incomingLinkTwo,
        },
        { enabled: !!senderWalletDetails && !!incomingLinkTwo }
    );

    const quoteSenderTwoOne = api.openPayments.createQoute.useQuery(
        {
            walletAddress: senderWalletDetailsTwo,
            incomingPaymentUrl: incomingLinkSenderTwo,
        },
        { enabled: !!senderWalletDetailsTwo && !!incomingLinkSenderTwo }
    );

    const quoteSenderTwoTwo = api.openPayments.createQoute.useQuery(
        {
            walletAddress: senderWalletDetailsTwo,
            incomingPaymentUrl: incomingLinkSenderTwoTwo,
        },
        { enabled: !!senderWalletDetailsTwo && !!incomingLinkSenderTwo }
    );

    const outgoingPaymentAuthorization = api.openPayments.getOutgoingPaymentAuthorization.useQuery(
      {
        walletAddress: senderWalletDetails,
        receiveAmount: {value: "" + (parseInt("1000000")/2), assetCode: "USD", assetScale: 2},
        redirectUrl: "http://localhost:3000/simple?sender=" + senderWalletDetailsTwo 
      },
      { enabled: false },
    );

    const outgoingPaymentAuthorizationTwo = api.openPayments.getOutgoingPaymentAuthorization.useQuery(
        {
          walletAddress: searchParams.get("sender") ?? "",
          receiveAmount: {value: "" + (parseInt("1000000")/2), assetCode: "USD", assetScale: 2},
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

        const senderTwoDetails = await senderWalletTwo.refetch();
        setSenderWalletDetailsTwo(senderTwoDetails.data?.data.id ?? "");
    }

    useEffect(() => {
        if(searchParams.get("interact_ref")){
            setInteractRef(searchParams.get("interact_ref") ?? "Undefined");
            console.log(searchParams.get(interact_ref));
        }
    }, []);

    useEffect(() => {
            createOutgoingPayment.refetch()
            .then((result) =>setPaymentSuccess(result.data?.success ?? false));
    }, [interact_ref])

    useEffect(() => {
        if(searchParams.get("sender") !== null){
            outgoingPaymentAuthorizationTwo.refetch().then((result) => {
                setRerdirectURLTwo(result.data?.data.interact.redirect ?? "undefined")
            });
        }
    }, [paymentSuccess])

    useEffect(() => {
        if (senderWalletDetails && receiverWalletDetails) {
            incomingPaymentSenderOne.refetch().then((result) => {
                setIncomingLink(result.data?.data.id ?? "");
            });
        }
    }, [senderWalletDetails, receiverWalletDetails]);

    useEffect(() => {
        if (senderWalletDetailsTwo && receiverWalletDetails) {
            incomingPaymentSenderTwo.refetch().then((result) => {
                setIncomingLinkSenderTwo(result.data?.data.id ?? "");
            });
        }
    }, [senderWalletDetailsTwo, receiverWalletDetails]);

    useEffect(() => {
        if (senderWalletDetails && receiverTwoWalletDetails) {
            incomingPaymentSenderOneTwo.refetch().then((result) => {
                setIncomingLinkTwo(result.data?.data.id ?? "");
                outgoingPaymentAuthorization.refetch().then((result) => {
                    setRerdirectURL(result.data?.data.interact?.redirect ?? "undefined")
                });
            });
        }
    }, [senderWalletDetails, receiverTwoWalletDetails]);

    useEffect(() => {
        if (senderWalletDetailsTwo && receiverTwoWalletDetails) {
            incomingPaymentSenderTwoTwo.refetch().then((result) => {
                setIncomingLinkSenderTwoTwo(result.data?.data.id ?? "");
            });
        }
    }, [senderWalletDetailsTwo, receiverTwoWalletDetails]);

    useEffect(() => {
        if (incomingLink) {
            quoteSenderOne.refetch();
        }
        if (incomingLinkTwo) {
            quoteSenderOneTwo.refetch();
        }
        if (incomingLinkSenderTwo) {
            quoteSenderTwoOne.refetch();
        }
        if (incomingLinkSenderTwoTwo) {
            quoteSenderTwoTwo.refetch();
        }
    }, [incomingLink, incomingLinkTwo, incomingLinkSenderTwo, incomingLinkSenderTwoTwo]);
;


    return (
        <>
        <div className="container mx-auto p-4">
            <ProductList products={products} onSelect={handleSelectProduct} />
            <h2 className="text-2xl font-semibold mt-8">Selected Products</h2>
            <ul className="list-disc list-inside">
                {selectedProducts.map((product) => (
                <li key={product.id}>
                    {product.name} - ${product.price.toFixed(2)}
                </li>
                ))}
            </ul>
        </div>
        <form
            onSubmit={makePayment}
            className="col-span-6 flex flex-col md:col-span-8"
        >
            {selectedProducts[0] &&
                <Button
                    className="data-[hover]:bg-foreground/10"
                    radius="full"
                    variant="solid"
                    color="primary"
                    type="submit"
                >
                    Make a Payment :)
                </Button>
            }
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
            {redirectURLTwo && (
                <span className="flex flex-col items-center pt-2 font-bold">
                      <Button
                        as={Link}
                        className="col col-span-1 justify-start"
                        variant="solid"
                        color="warning"
                        href={
                          outgoingPaymentAuthorizationTwo.data?.data.interact
                            ?.redirect
                        }
                      >
                        <FaLock size={15} />
                        Authorize Outgoing Payment 2
                      </Button>
                </span>
            )}
        </form>
        </>
    );
}
