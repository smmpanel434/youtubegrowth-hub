import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ServiceCard from "@/components/ServiceCard";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  Play, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock,
  Shield,
  Headphones,
  TrendingUp,
  Star,
  CheckCircle
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: "Welcome! 🚀",
      description: "Create your account to get started!",
      duration: 3000,
    });
    
    navigate("/auth");
    setIsLoading(false);
  };

  const handleViewServices = () => {
    navigate("/services");
  };

  const handleLearnMore = () => {
    navigate("/about");
  };
  const services = [
    {
      title: "YouTube Views",
      description: "High-quality views to boost your video visibility. Start time: 0-12 hours. Speed: 500-1000 per day",
      icon: Eye,
      price: "$2.99",
      originalPrice: "$4.99",
      features: ["Real viewers", "Instant start", "24/7 support", "Money-back guarantee"],
      isPopular: true,
      deliveryTime: "0-1 hours",
      category: "views",
    },
    {
      title: "YouTube Subscribers",
      description: "Grow your channel with real, active subscribers",
      icon: Users,
      price: "$8.99",
      features: ["Real subscribers", "Gradual delivery", "Lifetime guarantee", "Safe & secure"],
      deliveryTime: "1-3 days",
      category: "subscribers",
    },
    {
      title: "YouTube Likes",
      description: "Increase engagement with genuine likes",
      icon: Heart,
      price: "$1.99",
      features: ["High-quality likes", "Fast delivery", "Natural growth", "No password needed"],
      deliveryTime: "0-6 hours",
      category: "engagement",
    },
  ];

  const trustBadges = [
    { icon: Shield, title: "Secure Payments", description: "SSL encrypted checkout" },
    { icon: Clock, title: "Fast Delivery", description: "Results within hours" },
    { icon: Headphones, title: "24/7 Support", description: "Always here to help" },
    { icon: CheckCircle, title: "Guarantee", description: "Money-back promise" },
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "1M+", label: "Orders Completed" },
    { number: "99.9%", label: "Success Rate" },
    { number: "24/7", label: "Support Available" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="w-fit bg-primary/10 text-primary border-primary/20">
                  #1 YouTube SMM Service
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Grow Your{" "}
                  <span className="text-primary">YouTube</span>{" "}
                  Channel Today!
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Boost your YouTube presence with premium views, subscribers, and engagement. 
                  Fast, safe, and guaranteed results.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="btn-hero text-lg px-8 py-6"
                  onClick={handleGetStarted}
                  disabled={isLoading}
                >
                  <Play className="mr-2 h-5 w-5" fill="currentColor" />
                  {isLoading ? "Loading..." : "Start Growing Now"}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6"
                  onClick={handleViewServices}
                >
                  View Services
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img 
                src={heroImage} 
                alt="YouTube SMM Dashboard" 
                className="rounded-2xl shadow-strong w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-xl shadow-medium border">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-success" />
                  <div>
                    <div className="font-semibold">+250% Growth</div>
                    <div className="text-sm text-muted-foreground">This month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-soft">
                <CardContent className="space-y-3 p-0">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <badge.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{badge.title}</h3>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Our Services
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Premium YouTube Growth Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our most popular services to accelerate your YouTube success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8"
              onClick={handleViewServices}
            >
              View All Services
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Dominate YouTube?
            </h2>
            <p className="text-xl text-white/80">
              Join thousands of creators who've accelerated their growth with our premium services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-hero text-lg px-8 py-6"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                <Star className="mr-2 h-5 w-5" fill="currentColor" />
                {isLoading ? "Loading..." : "Get Started Today"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10"
                onClick={handleLearnMore}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;