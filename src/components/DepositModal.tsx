import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Building, Bitcoin, Copy, Smartphone } from "lucide-react";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DepositModal = ({ open, onClose, onSuccess }: DepositModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [transactionCode, setTransactionCode] = useState("");

  const usdToKesRate = 130; // Approximate exchange rate
  const kesAmount = amount ? (parseFloat(amount) * usdToKesRate).toFixed(2) : "0.00";

  const btcAddress = "bc1p53vpr7getgck5d4xva8xjgm7kldkwd7m0l837v7vv79j8vutxn3s3uux47";
  const mpesaPaybill = "775093";
  const mpesaAccount = "52332011";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const depositAmount = parseFloat(amount);
    if (depositAmount < 1) {
      toast({
        title: "Invalid amount",
        description: "Minimum deposit is $1.00",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: depositAmount,
          payment_method: paymentMethod,
          crypto_address: paymentMethod === 'crypto' ? btcAddress : paymentMethod === 'mpesa' ? `Paybill: ${mpesaPaybill}, Account: ${mpesaAccount}` : null,
          transaction_id: paymentMethod === 'mpesa' ? transactionCode : null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Deposit request created",
        description: paymentMethod === 'crypto' 
          ? "Please send Bitcoin to the provided address. Your account will be credited within 30 minutes after admin confirmation."
          : paymentMethod === 'mpesa'
          ? "Please send M-Pesa payment to the provided Paybill number. Your account will be credited after admin confirmation."
          : "Your deposit request has been submitted and will be processed shortly.",
      });

      onSuccess();
      setAmount("");
      setTransactionCode("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const copyBtcAddress = () => {
    navigator.clipboard.writeText(btcAddress);
    toast({
      title: "Copied!",
      description: "Bitcoin address copied to clipboard",
    });
  };

  const copyMpesaDetails = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const paymentMethods = [
    {
      id: "mpesa",
      label: "M-Pesa",
      icon: Smartphone,
      description: "Instant mobile payment"
    },
    {
      id: "crypto",
      label: "Bitcoin (BTC)",
      icon: Bitcoin,
      description: "1-6 confirmations"
    },
    {
      id: "card",
      label: "Credit/Debit Card",
      icon: CreditCard,
      description: "Instant processing"
    },
    {
      id: "bank_transfer",
      label: "Bank Transfer",
      icon: Building,
      description: "1-3 business days"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Choose your payment method and amount to add to your account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-2 flex-1 cursor-pointer">
                    <method.icon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {paymentMethod === 'mpesa' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">M-Pesa Payment Details</CardTitle>
                <CardDescription>Send payment via M-Pesa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Amount to Pay</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">KES {kesAmount}</p>
                    <p className="text-xs text-muted-foreground">Equivalent to ${amount || "0.00"} USD</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Paybill Number</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-bold">
                      {mpesaPaybill}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyMpesaDetails(mpesaPaybill, "Paybill number")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Account Number</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-bold">
                      {mpesaAccount}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyMpesaDetails(mpesaAccount, "Account number")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionCode" className="text-xs font-semibold">M-Pesa Transaction Code *</Label>
                  <Input
                    id="transactionCode"
                    type="text"
                    placeholder="e.g., SH12ABC34D"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                    required={paymentMethod === 'mpesa'}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the M-Pesa confirmation code you received via SMS
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  1. Go to M-Pesa menu<br/>
                  2. Select Lipa na M-Pesa → Pay Bill<br/>
                  3. Enter Paybill Number: {mpesaPaybill}<br/>
                  4. Enter Account Number: {mpesaAccount}<br/>
                  5. Enter amount: KES {kesAmount}<br/>
                  6. Confirm and enter transaction code above<br/>
                  Your account will be credited after admin confirms the payment.
                </p>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'crypto' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bitcoin Address</CardTitle>
                <CardDescription>Send Bitcoin to this address</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                    {btcAddress}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyBtcAddress}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Send the exact amount to this address. Your account will be credited within 30 minutes after admin confirmation of the blockchain transaction.
                </p>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'card' && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-destructive font-medium">
                  Credit card payments are temporarily unavailable in your region. Please use Bitcoin for deposits.
                </p>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'bank_transfer' && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-destructive font-medium">
                  Bank transfer is temporarily unavailable in your region. Please use Bitcoin for deposits.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !amount || (paymentMethod === 'mpesa' && !transactionCode) || (paymentMethod !== 'crypto' && paymentMethod !== 'mpesa')} 
              className="flex-1"
            >
              {loading ? "Processing..." : 
               (paymentMethod === 'crypto' || paymentMethod === 'mpesa') ? "Create Deposit Request" : "Unavailable in Region"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;