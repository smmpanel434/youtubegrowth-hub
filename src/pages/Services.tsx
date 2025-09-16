import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ServiceCard from "@/components/ServiceCard";
import { 
  Eye, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock,
  Play,
  Search,
  Filter
} from "lucide-react";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [category, setCategory] = useState("all");

  const allServices = [
    {
      title: "YouTube Views",
      description: "High-quality views to boost your video visibility",
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
    {
      title: "YouTube Comments",
      description: "Boost engagement with custom comments",
      icon: MessageCircle,
      price: "$5.99",
      features: ["Custom comments", "Real accounts", "Natural timing", "Moderation safe"],
      deliveryTime: "1-2 days",
      category: "engagement",
    },
    {
      title: "YouTube Shares",
      description: "Increase video reach with social shares",
      icon: Share2,
      price: "$3.99",
      features: ["Multiple platforms", "Real shares", "Organic growth", "Safe delivery"],
      deliveryTime: "2-4 hours",
      category: "engagement",
    },
    {
      title: "YouTube Watch Time",
      description: "Meet monetization requirements faster",
      icon: Clock,
      price: "$19.99",
      features: ["4000+ hours", "Gradual delivery", "Retention focused", "Algorithm friendly"],
      deliveryTime: "7-14 days",
      category: "watchtime",
    },
    {
      title: "YouTube Shorts Views",
      description: "Boost your Shorts with targeted views",
      icon: Play,
      price: "$1.49",
      features: ["Shorts optimized", "Fast delivery", "High retention", "Mobile focused"],
      deliveryTime: "0-2 hours",
      category: "views",
    },
    {
      title: "Premium YouTube Package",
      description: "Complete growth solution for serious creators",
      icon: Users,
      price: "$49.99",
      originalPrice: "$79.99",
      features: ["Views + Subscribers + Likes", "Premium support", "Custom strategy", "30-day guarantee"],
      isPopular: true,
      deliveryTime: "1-7 days",
      category: "packages",
    },
  ];

  const categories = [
    { value: "all", label: "All Services" },
    { value: "views", label: "Views" },
    { value: "subscribers", label: "Subscribers" },
    { value: "engagement", label: "Engagement" },
    { value: "watchtime", label: "Watch Time" },
    { value: "packages", label: "Packages" },
  ];

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || service.category === category;
    return matchesSearch && matchesCategory;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price.replace("$", "")) - parseFloat(b.price.replace("$", ""));
      case "price-high":
        return parseFloat(b.price.replace("$", "")) - parseFloat(a.price.replace("$", ""));
      case "popular":
        return b.isPopular ? 1 : -1;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            All Services
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold">
            YouTube Growth Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our comprehensive range of YouTube marketing services to accelerate your channel growth
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {sortedServices.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>

        {sortedServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No services found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-muted/30 rounded-2xl p-8 mt-16">
          <h2 className="text-2xl font-bold mb-4">
            Need a Custom Package?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Looking for something specific? Our team can create a custom package tailored to your exact needs and budget.
          </p>
          <Button className="btn-hero">
            Contact Us for Custom Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Services;