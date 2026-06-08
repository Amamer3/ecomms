import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingBag, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { RequireCustomer } from "@/components/RequireCustomer";
import { Footer } from "@/components/Footer";
import { PhoneInput } from "@/components/PhoneInput";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { checkout, createAddress, listAddresses, validatePromotion, verifyPaymentOtp } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors";
import { needsMomoOtpVerification, type CheckoutResult } from "@/lib/api/types";
import { formatGhs } from "@/lib/format-money";
import { ghanaPhoneInputFrom, normalizeE164Phone } from "@/lib/phone";
import {
  customerInputCls,
  CustomerDetailGrid,
  CustomerPageHeader,
} from "@/components/customer/customer-ui";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — GoMarket" }] }),
});

function CheckoutPage() {
  const { session } = useAuth();
  const { items, subtotal, storeId, clear } = useCart();
  const sessionPhone = ghanaPhoneInputFrom(session?.phone);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [phase, setPhase] = useState<"form" | "otp" | "complete">("form");
  const [otpCode, setOtpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [momoNumber, setMomoNumber] = useState(sessionPhone);
  const [notes, setNotes] = useState("");
  const [addressForm, setAddressForm] = useState({
    line1: "",
    city: "Accra",
    lat: 5.6037,
    lng: -0.187,
    contactPhone: sessionPhone,
  });

  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: listAddresses,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      let addressId = selectedAddressId || addresses.find((a) => a.isDefault)?.id;
      if (!addressId) {
        if (!addressForm.line1.trim()) {
          toast.error("Add a delivery address");
          setSubmitting(false);
          return;
        }
        const created = await createAddress({
          line1: addressForm.line1,
          city: addressForm.city,
          lat: addressForm.lat,
          lng: addressForm.lng,
          country: "GH",
          contactPhone: addressForm.contactPhone || undefined,
          isDefault: true,
        });
        addressId = created.id;
        await refetchAddresses();
      }

      const momo = normalizeE164Phone(momoNumber);
      if (!momo) {
        toast.error("MoMo number must be E.164, e.g. +233200000001");
        setSubmitting(false);
        return;
      }

      if (promoCode.trim()) {
        try {
          await validatePromotion(promoCode.trim(), storeId, subtotal.toFixed(2));
        } catch {
          toast.error("Invalid promotion code");
          setSubmitting(false);
          return;
        }
      }

      const result = await checkout({
        storeId,
        addressId,
        momoNumber: momo,
        notes: notes.trim() || undefined,
        promoCode: promoCode.trim() || undefined,
        channel: "MOMO",
        provider: "MOOLRE",
        idempotencyKey: crypto.randomUUID(),
      });

      setCheckoutResult(result);
      await clear();

      if (needsMomoOtpVerification(result.nextAction)) {
        setPhase("otp");
        setOtpCode("");
        toast.success(result.nextAction?.message ?? "Verification code sent to your phone");
      } else {
        setPhase("complete");
        toast.success(result.nextAction?.message ?? "Approve the MoMo payment on your phone");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Checkout failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutResult) return;
    if (otpCode.trim().length < 4) {
      toast.error("Enter the verification code from your phone");
      return;
    }

    setVerifyingOtp(true);
    try {
      const verified = await verifyPaymentOtp(checkoutResult.payment.id, otpCode);
      setCheckoutResult({
        ...checkoutResult,
        payment: verified.payment,
        nextAction: verified.nextAction,
      });
      setPhase("complete");
      toast.success(
        verified.nextAction?.message ?? "Code accepted — approve the MoMo payment on your phone",
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid verification code"));
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (phase === "otp" && checkoutResult) {
    const { order, payment, nextAction } = checkoutResult;
    return (
      <RequireCustomer>
        <div className="min-h-screen bg-background">
          <Navbar />
          <section className="mx-auto max-w-lg px-4 py-16 sm:px-6">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Smartphone className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-center font-display text-3xl font-semibold">
              Verify your number
            </h1>
            <p className="mt-3 text-center text-muted-foreground">
              {nextAction?.message ??
                "Enter the verification code sent to your MoMo number. After this, approve the payment on your phone — we never ask for your MoMo PIN here."}
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Order {order.orderNumber} · {formatGhs(parseMoney(order.total))}
            </p>
            {payment.momoNumber ? (
              <p className="mt-1 text-center text-sm font-medium">{payment.momoNumber}</p>
            ) : null}

            <form onSubmit={(e) => void submitOtp(e)} className="mt-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="payment-otp" className="block text-center">
                  Verification code
                </Label>
                <InputOTP
                  id="payment-otp"
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={verifyingOtp}
                  containerClassName="justify-center gap-2"
                >
                  <InputOTPGroup className="gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 w-11 rounded-xl border border-input text-lg font-semibold first:rounded-xl last:rounded-xl"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <button
                type="submit"
                disabled={verifyingOtp || otpCode.trim().length < 4}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  "Verify & send payment to phone"
                )}
              </button>
            </form>
          </section>
          <Footer />
        </div>
      </RequireCustomer>
    );
  }

  if (phase === "complete" && checkoutResult) {
    const { order, payment, nextAction } = checkoutResult;
    return (
      <RequireCustomer>
        <div className="min-h-screen bg-background">
          <Navbar />
          <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-center font-display text-3xl font-semibold">
              Order {order.orderNumber}
            </h1>
            <p className="mt-3 text-center text-muted-foreground">
              {nextAction?.message ??
                "A MoMo payment prompt was sent to your phone. Approve it there to complete payment — your MoMo PIN is only entered on your phone."}
            </p>

            <div className="mt-8 space-y-6">
              <CustomerDetailGrid
                rows={[
                  { label: "Order status", value: order.status },
                  { label: "Payment status", value: payment.status },
                  { label: "Channel", value: payment.channel ?? "MOMO" },
                  { label: "Subtotal", value: formatGhs(parseMoney(order.subtotal)) },
                  { label: "Delivery fee", value: formatGhs(parseMoney(order.deliveryFee)) },
                  { label: "Service fee", value: formatGhs(parseMoney(order.serviceFee)) },
                  ...(parseMoney(order.discountTotal) > 0
                    ? [{ label: "Discount", value: `−${formatGhs(parseMoney(order.discountTotal))}` }]
                    : []),
                  { label: "Total", value: formatGhs(parseMoney(order.total)) },
                  ...(payment.momoNumber
                    ? [{ label: "MoMo number", value: payment.momoNumber }]
                    : []),
                ]}
              />

            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/account/orders/$orderId"
                params={{ orderId: order.id }}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                View order
              </Link>
              <Link
                to="/account/transactions/$paymentId"
                params={{ paymentId: payment.id }}
                className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold"
              >
                View payment
              </Link>
              <Link
                to="/shop"
                search={{ storeId: order.storeId }}
                className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold"
              >
                Keep shopping
              </Link>
            </div>
          </section>
          <Footer />
        </div>
      </RequireCustomer>
    );
  }

  if (!storeId || items.length === 0) {
    return (
      <RequireCustomer>
        <div className="min-h-screen bg-background">
          <Navbar />
          <section className="mx-auto max-w-2xl px-4 py-24 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <h1 className="mt-6 font-display text-3xl font-semibold">Nothing to checkout</h1>
            <p className="mt-3 text-muted-foreground">
              Add items to your cart first, then return here to create a pending order and MoMo payment.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/cart"
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                View cart
              </Link>
              <Link
                to="/shop"
                className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold"
              >
                Browse stores
              </Link>
            </div>
          </section>
          <Footer />
        </div>
      </RequireCustomer>
    );
  }

  return (
    <RequireCustomer>
      <div className="min-h-screen bg-background">
        <Navbar overlay />
        <PageHero>
          <Link
            to="/cart"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to cart
          </Link>
          <CustomerPageHeader
            title="Checkout"
            description="Create a pending order and pending MoMo payment from your active store cart."
          />
        </PageHero>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <form onSubmit={(e) => void submit(e)} className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <Section title="Delivery address">
                {addresses.length > 0 ? (
                  <div className="space-y-2 sm:col-span-2">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3"
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={(selectedAddressId || addresses.find((x) => x.isDefault)?.id) === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                        />
                        <span className="text-sm">
                          <span className="font-medium">{a.label ?? "Address"}</span>
                          <br />
                          {a.line1}, {a.city}
                        </span>
                      </label>
                    ))}
                    <Link
                      to="/account/addresses"
                      className="inline-block text-sm font-medium text-primary hover:underline"
                    >
                      Manage addresses
                    </Link>
                  </div>
                ) : (
                  <>
                    <Field
                      label="Street address"
                      required
                      value={addressForm.line1}
                      onChange={(v) => setAddressForm((f) => ({ ...f, line1: v }))}
                      full
                    />
                    <Field
                      label="City"
                      required
                      value={addressForm.city}
                      onChange={(v) => setAddressForm((f) => ({ ...f, city: v }))}
                    />
                    <Field
                      label="Contact phone"
                      phone
                      value={addressForm.contactPhone}
                      onChange={(v) => setAddressForm((f) => ({ ...f, contactPhone: v }))}
                    />
                    <p className="text-xs text-muted-foreground sm:col-span-2">
                      Or{" "}
                      <Link to="/account/addresses" className="font-medium text-primary hover:underline">
                        add a saved address
                      </Link>{" "}
                      first.
                    </p>
                  </>
                )}
                <Field label="Delivery notes" value={notes} onChange={setNotes} full />
              </Section>

              <Section title="Mobile Money payment">
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Placing your order may send a verification code to your MoMo number — enter it on
                  the next screen. After that, approve the payment on your phone. We never ask for
                  your MoMo PIN in the browser.
                </p>
                <Field
                  label="MoMo number"
                  phone
                  required
                  value={momoNumber}
                  onChange={setMomoNumber}
                  full
                />
                <Field label="Promo code (optional)" value={promoCode} onChange={setPromoCode} full />
              </Section>
            </div>

            <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-semibold">Order summary</h2>
              <p className="mt-1 text-xs text-muted-foreground">Store {storeId.slice(0, 8)}…</p>
              <ul className="mt-4 max-h-72 space-y-3 overflow-auto text-sm">
                {items.map(({ item }) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-medium">{formatGhs(parseMoney(item.lineTotal))}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-base font-semibold">
                Subtotal {formatGhs(subtotal)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Delivery and service fees are calculated when the order is created.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {submitting ? (
                  "Creating order…"
                ) : (
                  <>
                    <span className="sm:hidden">Place order</span>
                    <span className="hidden sm:inline">Place order & pay with MoMo</span>
                  </>
                )}
              </button>
            </aside>
          </form>
        </section>
        <Footer />
      </div>
    </RequireCustomer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  full,
  phone,
  value,
  onChange,
  ...rest
}: {
  label: string;
  full?: boolean;
  phone?: boolean;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      {phone ? (
        <PhoneInput {...rest} value={value} onChange={onChange} className={customerInputCls} />
      ) : (
        <input
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={customerInputCls}
        />
      )}
    </label>
  );
}
