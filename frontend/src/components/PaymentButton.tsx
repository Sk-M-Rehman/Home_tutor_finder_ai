'use client';

import { useState } from 'react';
import { useCreatePaymentOrder, useVerifyRequestPayment } from '@/features/student/hooks';
import { errorMessage } from '@/lib/api';
import { inr } from '@/lib/utils';
import { useToast } from '@/store/toast';
import { Button } from './Button';

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

let sdkLoad: Promise<void> | undefined;

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (sdkLoad) return sdkLoad;
  const loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Razorpay checkout. Check your connection and retry.'));
    document.body.appendChild(script);
  }).catch((error: unknown) => {
    sdkLoad = undefined;
    throw error;
  });
  sdkLoad = loading;
  return loading;
}

export function PaymentButton({ requestId, amount }: { requestId: number; amount: number }) {
  const [loading, setLoading] = useState(false);
  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyRequestPayment();
  const toast = useToast((s) => s.push);

  const startPayment = async () => {
    setLoading(true);
    try {
      await loadRazorpay();
      const order = await createOrder.mutateAsync(requestId);
      if (!window.Razorpay) throw new Error('Razorpay checkout did not initialize. Please retry.');

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.orderId,
        handler: async (response) => {
          setLoading(true);
          try {
            await verifyPayment.mutateAsync({
              requestId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast('success', 'Payment successful. Your tutoring request is confirmed.');
          } catch (error) {
            toast('error', `Payment verification failed: ${errorMessage(error)}`);
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      checkout.on('payment.failed', (response) => {
        setLoading(false);
        toast('error', response.error?.description ?? 'Payment failed. You can try again.');
      });
      checkout.open();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast('error', error instanceof Error ? error.message : errorMessage(error));
    }
  };

  return (
    <Button variant="accent" loading={loading} onClick={startPayment}>
      Pay {inr(amount)}
    </Button>
  );
}
