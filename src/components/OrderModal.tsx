import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  description: string;
  price_per_1000: number;
  category: string;
}

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderModal = ({ open, onClose, onSuccess }: OrderModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open]);

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (data) setServices(data);
  };

  const calculateTotal = () => {
    if (!selectedService || !quantity) return 0;
    const qty = parseInt(quantity);
    return (selectedService.price_per_1000 / 1000) * qty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedService || !profile) return;

    const qty = parseInt(quantity);
    const total = calculateTotal();

    if (qty < 100) {
      toast({
        title: "Invalid quantity",
        description: "Minimum order quantity is 100",
        variant: "destructive"
      });
      return;
    }

    if (total > profile.balance) {
      toast({
        title: "Insufficient funds",
        description: "Please add funds to your account first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create order and update balance in a transaction
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_id: selectedService.id,
          quantity: qty,
          link: link,
          total_amount: total,
          status: 'pending'
        });

      if (orderError) throw orderError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: profile.balance - total 
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Order created!",
        description: "Your order has been submitted and will be processed shortly.",
      });

      onSuccess();
      setQuantity("");
      setLink("");
      setSelectedService(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Select a service and place your order
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Service</Label>
            <Select onValueChange={(value) => {
              const service = services.find(s => s.id === value);
              setSelectedService(service || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedServices).map(([category, categoryServices]) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground capitalize">
                      {category}
                    </div>
                    {categoryServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col">
                          <span>{service.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ${service.price_per_1000}/1000
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {selectedService && (
              <p className="text-sm text-muted-foreground">
                {selectedService.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="100"
              step="100"
              placeholder="Minimum 100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum order: 100 units
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link/URL</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com/your-content"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          </div>

          {selectedService && quantity && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span>Total Cost:</span>
                <span className="font-bold text-lg">${calculateTotal().toFixed(2)}</span>
              </div>
              {profile && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Account Balance:</span>
                  <span>${profile.balance}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedService || !quantity || !link || (profile && calculateTotal() > profile.balance)} 
              className="flex-1"
            >
              {loading ? "Creating Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;