import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Package, 
  MessageSquare, 
  Plus,
  History,
  LogOut,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  Send,
  Eye,
  Gift,
  Sparkles
} from "lucide-react";
import DepositModal from "@/components/DepositModal";
import OrderModal from "@/components/OrderModal";
import SupportTicketModal from "@/components/SupportTicketModal";
import santaImage from "@/assets/santa-christmas.jpg";

interface Order {
  id: string;
  service_id: string;
  quantity: number;
  link: string;
  total_amount: number;
  status: string;
  created_at: string;
  start_time: string | null;
  before_count: number | null;
  current_count: number | null;
  services: {
    name: string;
  };
}

interface Deposit {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
}

interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  admin_id: string | null;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketReplies, setTicketReplies] = useState<Record<string, TicketReply[]>>({});
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    totalDeposits: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchDeposits();
      calculateStats();
      fetchTickets();

      // Set up real-time subscriptions
      const ordersChannel = supabase
        .channel('orders-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
          () => {
            fetchOrders();
            calculateStats();
          }
        )
        .subscribe();

      const depositsChannel = supabase
        .channel('deposits-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'deposits', filter: `user_id=eq.${user.id}` },
          () => {
            fetchDeposits();
            calculateStats();
          }
        )
        .subscribe();

      const ticketsChannel = supabase
        .channel('tickets-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'support_tickets', filter: `user_id=eq.${user.id}` },
          () => {
            fetchTickets();
          }
        )
        .subscribe();

      const repliesChannel = supabase
        .channel('ticket-replies-changes')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ticket_replies' },
          (payload) => {
            // Check if this reply is for one of user's tickets
            const ticketId = payload.new.ticket_id;
            const userTicket = tickets.find(t => t.id === ticketId);
            if (userTicket && payload.new.is_admin_reply) {
              fetchTicketReplies(ticketId);
              // Show notification for admin replies
              toast({
                title: "New Message Received",
                description: `Admin replied to your ticket: "${userTicket.subject}"`,
              });
            } else if (userTicket) {
              fetchTicketReplies(ticketId);
            }
          }
        )
        .subscribe();

      return () => {
        ordersChannel.unsubscribe();
        depositsChannel.unsubscribe(); 
        ticketsChannel.unsubscribe();
        repliesChannel.unsubscribe();
      };
    }
  }, [user, tickets]);

  const calculateStats = async () => {
    if (!user) return;

    try {
      // Get orders stats
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('user_id', user.id);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
      }

      // Get deposits stats  
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('amount, status')
        .eq('user_id', user.id);

      if (depositsError) {
        console.error('Error fetching deposits:', depositsError);
        return;
      }

      if (ordersData && depositsData) {
        const totalOrders = ordersData.length;
        const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
        const totalSpent = ordersData.reduce((sum, o) => sum + Number(o.total_amount), 0);
        const totalDeposits = depositsData
          .filter(d => d.status === 'completed')
          .reduce((sum, d) => sum + Number(d.amount), 0);

        setStats({
          totalOrders,
          pendingOrders,
          totalSpent,
          totalDeposits
        });
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }
      
      if (data) setOrders(data);
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
    }
  };

  const fetchDeposits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deposits:', error);
        return;
      }
      
      if (data) setDeposits(data);
    } catch (error) {
      console.error('Unexpected error fetching deposits:', error);
    }
  };

  const fetchTickets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tickets:', error);
        return;
      }
      
      if (data) setTickets(data);
    } catch (error) {
      console.error('Unexpected error fetching tickets:', error);
    }
  };

  const fetchTicketReplies = async (ticketId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching ticket replies:', error);
        return;
      }
      
      setTicketReplies(prev => ({
        ...prev,
        [ticketId]: data || []
      }));
    } catch (error) {
      console.error('Unexpected error fetching ticket replies:', error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('ticket_replies')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: replyMessage,
          is_admin_reply: false
        });

      if (error) throw error;

      toast({
        title: "Reply sent",
        description: "Your reply has been sent to support.",
      });

      setReplyMessage("");
      fetchTicketReplies(selectedTicket.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openTicketDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
    fetchTicketReplies(ticket.id);
  };

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchDeposits(),
        fetchTickets(),
        calculateStats()
      ]);
      
      toast({
        title: "Refreshed",
        description: "Data has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-500",
      "in progress": "bg-purple-500",
      active: "bg-blue-500", 
      processing: "bg-blue-500",
      completed: "bg-green-500",
      failed: "bg-red-500",
      open: "bg-yellow-500",
      closed: "bg-gray-500"
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile.full_name || profile.email}</p>
          </div>
          <div className="flex gap-4">
            {profile.is_admin && (
              <Button onClick={() => navigate("/admin")} variant="outline">
                Admin Panel
              </Button>
            )}
            <Button onClick={handleSignOut} variant="ghost">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${profile.balance}</div>
              <p className="text-xs text-muted-foreground">Available funds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalDeposits.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Completed deposits</p>
            </CardContent>
          </Card>
        </div>

        {/* Christmas Promotion Banner */}
        <Card className="mb-8 bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/20 dark:to-green-950/20 border-2 border-red-200 dark:border-red-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 animate-bounce">
            <Gift className="h-16 w-16 text-red-500 opacity-20" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <img src={santaImage} alt="Santa Christmas" className="w-32 h-32 md:w-40 md:h-40 object-contain animate-pulse" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-spin" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-2 flex items-center justify-center md:justify-start gap-2">
                  <Gift className="h-6 w-6" />
                  Christmas Special Offer! 
                  <Gift className="h-6 w-6" />
                </h3>
                <p className="text-lg md:text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
                  Get 50% BONUS on deposits over $50!
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Limited time offer! Deposit $50 or more and receive an extra 50% bonus added to your account. 
                  Perfect time to stock up for your growth needs! 🎄✨
                </p>
                <Button onClick={() => setShowDepositModal(true)} size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                  <Gift className="mr-2 h-5 w-5" />
                  Claim Your Bonus Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setShowDepositModal(true)} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
          <Button onClick={() => setShowOrderModal(true)} variant="outline" className="flex-1">
            <Package className="h-4 w-4 mr-2" />
            New Order
          </Button>
          <Button onClick={() => setShowSupportModal(true)} variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Support
          </Button>
          <Button onClick={handleRefresh} variant="ghost" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track your service orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-lg">{order.services.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Order ID: {order.id.slice(0, 8)}...
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">${order.total_amount}</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t border-b">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Link</p>
                            <p className="text-sm font-medium truncate">{order.link}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                            <p className="text-sm font-medium">{order.quantity} units</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Before Count</p>
                            <p className="text-sm font-medium">
                              {order.before_count !== null ? order.before_count.toLocaleString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Current Count</p>
                            <p className="text-sm font-medium">
                              {order.current_count !== null ? order.current_count.toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                            <p className="text-sm font-medium">
                              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                            <p className="text-sm font-medium">
                              {order.start_time 
                                ? `${new Date(order.start_time).toLocaleDateString()} at ${new Date(order.start_time).toLocaleTimeString()}`
                                : 'Not started yet'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Deposit History</CardTitle>
                <CardDescription>View your payment history</CardDescription>
              </CardHeader>
              <CardContent>
                {deposits.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No deposits yet</p>
                ) : (
                  <div className="space-y-4">
                    {deposits.map((deposit) => (
                      <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">${deposit.amount}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {deposit.payment_method.replace('_', ' ')} • {new Date(deposit.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(deposit.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>View and manage your support requests</CardDescription>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No support tickets yet</p>
                    <Button onClick={() => setShowSupportModal(true)}>
                      Create Support Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ticket.subject}</span>
                            {getStatusBadge(ticket.status)}
                            <Badge variant="outline">{ticket.priority}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openTicketDialog(ticket)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                      </div>
                    ))}
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => setShowSupportModal(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ticket Conversation Dialog */}
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Support Ticket: {selectedTicket?.subject}
                  </DialogTitle>
                </DialogHeader>
                
                {selectedTicket && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedTicket.status)}
                          <Badge variant="outline">{selectedTicket.priority}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(selectedTicket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{selectedTicket.message}</p>
                    </div>

                    {/* Replies */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {ticketReplies[selectedTicket.id]?.map((reply) => (
                        <div 
                          key={reply.id} 
                          className={`p-3 rounded-lg ${reply.is_admin_reply ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {reply.is_admin_reply ? 'Support Team' : 'You'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{reply.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Form - Only show if ticket is open */}
                    {selectedTicket.status === 'open' && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your reply..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                            <Send className="h-4 w-4 mr-1" />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedTicket.status === 'closed' && (
                      <div className="text-center text-muted-foreground py-4">
                        This ticket has been closed. Create a new ticket if you need further assistance.
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>

      <DepositModal 
        open={showDepositModal} 
        onClose={() => setShowDepositModal(false)}
        onSuccess={() => {
          setShowDepositModal(false);
          // Refresh profile to get updated balance
          window.location.reload();
        }}
      />
      
      <OrderModal 
        open={showOrderModal} 
        onClose={() => setShowOrderModal(false)}
        onSuccess={() => {
          setShowOrderModal(false);
          fetchOrders();
          calculateStats();
          // Refresh profile to get updated balance
          window.location.reload();
        }}
      />
      
      <SupportTicketModal 
        open={showSupportModal} 
        onClose={() => setShowSupportModal(false)}
        onSuccess={() => {
          setShowSupportModal(false);
          fetchTickets();
        }}
      />
    </div>
  );
};

export default Dashboard;