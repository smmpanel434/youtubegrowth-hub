import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle,
  Target,
  Zap,
  Heart
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "100% Safe & Secure",
      description: "All our services comply with YouTube's terms and use only legitimate methods."
    },
    {
      icon: Users,
      title: "Real Engagement",
      description: "We provide genuine views, likes, and subscribers from real active accounts."
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Most orders start within minutes and complete within the promised timeframe."
    },
    {
      icon: Award,
      title: "Trusted by 50K+",
      description: "Over 50,000 creators trust us to grow their YouTube channels safely."
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "98% of our clients see significant channel growth within the first month."
    },
    {
      icon: CheckCircle,
      title: "Money-Back Guarantee",
      description: "Not satisfied? We offer a full refund within 30 days, no questions asked."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Happy Customers", icon: Users },
    { number: "1M+", label: "Orders Completed", icon: CheckCircle },
    { number: "99.9%", label: "Success Rate", icon: Target },
    { number: "5 Years", label: "Industry Experience", icon: Award },
  ];

  const team = [
    {
      name: "Marketing Team",
      role: "YouTube Growth Specialists",
      description: "Expert marketers with 5+ years in YouTube algorithm optimization."
    },
    {
      name: "Technical Team",
      role: "Platform Engineers",
      description: "Ensuring our delivery systems are fast, reliable, and secure."
    },
    {
      name: "Support Team",
      role: "Customer Success",
      description: "24/7 support to help you achieve your YouTube growth goals."
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            About SMMTube
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold max-w-3xl mx-auto">
            The Most Trusted YouTube Growth Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We've been helping creators achieve their YouTube dreams since 2019. 
            Our mission is simple: provide safe, effective, and affordable growth solutions.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6 service-card">
              <CardContent className="space-y-3 p-0">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Mission */}
        <div className="mb-16">
          <Card className="service-card p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                    Our Mission
                  </Badge>
                  <h2 className="text-3xl font-bold mb-4">
                    Empowering Creators to Reach Their Full Potential
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We believe every creator deserves a chance to be discovered. That's why we've built 
                    the most comprehensive and safe YouTube growth platform, helping creators break through 
                    the noise and reach their target audience.
                  </p>
                  <p className="text-muted-foreground">
                    Our team of experts continuously monitors YouTube's algorithm changes to ensure our 
                    services remain effective and compliant. We're not just a service provider – we're 
                    your growth partner.
                  </p>
                </div>
                <Button className="btn-hero">
                  Start Your Growth Journey
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold">Lightning Fast</div>
                    <div className="text-sm text-muted-foreground">Results start showing within hours</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold">100% Safe</div>
                    <div className="text-sm text-muted-foreground">Compliant with all platform rules</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold">Real Results</div>
                    <div className="text-sm text-muted-foreground">Genuine engagement from real users</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SMMTube?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built our reputation on delivering consistent, high-quality results for creators worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="service-card p-6">
                <CardContent className="space-y-4 p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Expert Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Behind every successful campaign is our dedicated team of YouTube growth specialists.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="service-card p-6 text-center">
                <CardContent className="space-y-4 p-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary text-sm mb-2">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-dark rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your YouTube Channel?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've already accelerated their growth with our proven services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-hero text-lg px-8 py-6">
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10">
              View Our Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;