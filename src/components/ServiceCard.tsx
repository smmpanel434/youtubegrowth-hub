import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  price: string;
  originalPrice?: string;
  features: string[];
  isPopular?: boolean;
  deliveryTime: string;
}

const ServiceCard = ({
  title,
  description,
  icon: Icon,
  price,
  originalPrice,
  features,
  isPopular = false,
  deliveryTime,
}: ServiceCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOrderClick = async () => {
    setIsLoading(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Order Added to Cart! 🛒",
      description: `${title} - ${price} has been added. Please connect Supabase to complete orders.`,
      duration: 4000,
    });
    
    setIsLoading(false);
  };
  return (
    <Card className={`service-card relative ${isPopular ? "ring-2 ring-primary" : ""}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="flex items-baseline justify-center space-x-2">
            <span className="text-3xl font-bold text-foreground">{price}</span>
            {originalPrice && (
              <span className="text-lg text-muted-foreground line-through">{originalPrice}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Delivery: {deliveryTime}</p>
        </div>

        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full btn-hero" 
          onClick={handleOrderClick}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Order Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;