import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { cartApi, PaymentMethod } from "@/api/cart";
import { useAuth } from "@/contexts/AuthContext";

const Checkout = () => {
  const { user } = useAuth();
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethodId) {
      setError("Payment method ID is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await cartApi.checkout({
        payment_method_id: Number(paymentMethodId),
        notes: notes.trim() || undefined,
      });

      if (response.status >= 200 && response.status < 300) {
        setSuccess(`Order #${response.data.order.id} created successfully!`);
        setPaymentMethodId("");
        setNotes("");
      } else {
        setError(response.data.message || "Failed to create order");
      }
    } catch (error: any) {
      console.error("Checkout error:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || "An error occurred during checkout",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="container px-4 mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              You must be logged in to checkout. Please{" "}
              <Link to="/login">log in</Link>.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container px-4 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Checkout</h1>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label
                  htmlFor="payment-method-id"
                  className="block text-sm font-medium"
                >
                  Payment Method ID
                </label>
                <Input
                  id="payment-method-id"
                  type="number"
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  placeholder="Enter payment method ID"
                  required
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium">
                  Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for the order"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
