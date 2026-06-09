import { useEffect, useRef } from "react";

const PayPalCheckout = ({ amount, onSuccess }) => {
    const paypalRef = useRef();

    useEffect(() => {
        const loadPayPalScript = async () => {
            if (window.paypal) {
                renderButtons();
                return;
            }

            const script = document.createElement("script");
            script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD";
            script.async = true;
            script.onload = () => renderButtons();
            document.body.appendChild(script);
        };

        const renderButtons = () => {
            if (!paypalRef.current) return;
            // clear previous buttons to avoid duplicates
            paypalRef.current.innerHTML = "";

            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: amount.toString(),
                                },
                            },
                        ],
                    });
                },
                onApprove: async (data, actions) => {
                    const order = await actions.order.capture();
                    console.log("Order Successful:", order);
                    if (onSuccess) onSuccess(order);
                    else alert("Payment Successful!");
                },
                onError: (err) => {
                    console.error("PayPal Error:", err);
                    alert("Payment Failed");
                }
            }).render(paypalRef.current);
        };

        loadPayPalScript();
    }, [amount]);

    return <div ref={paypalRef}></div>;
};

export default PayPalCheckout;
