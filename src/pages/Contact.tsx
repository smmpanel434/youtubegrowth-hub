import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageCircle, 
  Mail, 
  Clock, 
  HelpCircle,
  Send,
  Phone,
  MapPin,
  Headphones
} from "lucide-react";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });

  const createSupportTicket = async (ticketData: {
    subject: string;
    message: string;
    priority: string;
    category?: string;
  }) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to create a support ticket.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: ticketData.subject,
          message: ticketData.message,
          priority: ticketData.priority,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Support ticket created!",
        description: "We'll get back to you within 2 hours.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create support ticket",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await createSupportTicket({
      subject: formData.subject,
      message: `Name: ${formData.name}\nEmail: ${formData.email}\nCategory: ${formData.category || 'General'}\n\nMessage:\n${formData.message}`,
      priority: 'medium',
      category: formData.category
    });
    
    if (success) {
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: ""
      });
    }
    
    setIsSubmitting(false);
  };

  const handleContactMethod = async (method: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to access support.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    const ticketSubject = `${method} Support Request`;
    const ticketMessage = `User has requested ${method.toLowerCase()} support. Please contact them directly for immediate assistance.`;
    
    let priority = 'medium';
    if (method === 'Priority Support') priority = 'high';
    if (method === 'Live Chat') priority = 'high';
    
    const success = await createSupportTicket({
      subject: ticketSubject,
      message: ticketMessage,
      priority
    });

    if (success) {
      toast({
        title: `${method} request created!`,
        description: "Your support request has been created. We'll be in touch soon.",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "24/7 Available"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed questions or concerns",
      action: "Send Email",
      available: "Response within 2 hours"
    },
    {
      icon: Phone,
      title: "Priority Support",
      description: "Direct line for premium customers",
      action: "Call Now",
      available: "Business hours only"
    }
  ];

  const faqItems = [
    {
      question: "How long does delivery take?",
      answer: "Most services start within 0-6 hours and complete within the timeframe specified for each service."
    },
    {
      question: "Is it safe for my YouTube channel?",
      answer: "Yes, all our services are 100% safe and comply with YouTube's terms of service."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee if you're not satisfied with our services."
    },
    {
      question: "Can I track my order progress?",
      answer: "Yes, you'll receive order updates and can track progress through your dashboard."
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Contact Us
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold">
            We're Here to Help
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our services? Need support with an order? Our team is ready to assist you 24/7.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="service-card p-4">
                    <CardContent className="p-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <method.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{method.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{method.description}</p>
                          <p className="text-xs text-primary mb-2">{method.available}</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => handleContactMethod(method.title)}
                          >
                            {method.action}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <Card className="service-card p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>support@smmtube.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>24/7 Customer Support</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                  <span>Average response: 15 minutes</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="service-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject *</label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Brief description of your inquiry"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="order-support">Order Support</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-hero w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Quick answers to common questions</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqItems.map((faq, index) => (
              <Card key={index} className="service-card p-6">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Can't find what you're looking for?</p>
            <Button 
              variant="outline"
              onClick={() => toast({
                title: "FAQ Coming Soon! 📚",
                description: "We're building a comprehensive FAQ section for you.",
                duration: 3000,
              })}
            >
              View Full FAQ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;