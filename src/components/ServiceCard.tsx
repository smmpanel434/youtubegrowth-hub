import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import OrderModal from "./OrderModal";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  price: string;
  originalPrice?: string;
  features: string[];
  isPopular?: boolean;
  deliveryTime: string;
  category: string;
}

const ServiceCard = ({
  title,
  description,
  icon: Icon,
  price,
  originalPrice,
  features,
  isPopular,
  deliveryTime,
  category,
}: ServiceCardProps) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { user } = useAuth();

  const handleOrder = () => {
    if (!user) {
      // Redirect to auth page or show login modal
      return;
    }
    setShowOrderModal(true);
  };

  return (
    <>
      <Card className={`relative h-full transition-all duration-300 hover:shadow-lg ${isPopular ? 'ring-2 ring-primary' : ''}`}>
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Icon className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Delivery: {deliveryTime}
            </span>
          </div>

          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className="h-1.5 w-1.5 bg-primary rounded-full mr-2" />
                {feature}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{price}</span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {originalPrice}
                  </span>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleOrder}
              className="w-full"
              disabled={!user}
            >
              {user ? 'Order Now' : 'Login to Order'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <OrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onSuccess={() => {
          setShowOrderModal(false);
          // Could add a toast or callback here
        }}
      />
    </>
  );
};

export default ServiceCard;