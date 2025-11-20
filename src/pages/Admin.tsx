import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, CheckCircle, XCircle, MessageSquare, Send, Eye } from "lucide-react";

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  admin_notes?: string;
  verified_by?: string;
  verified_at?: string;
  transaction_id?: string;
  crypto_address?: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  total_amount: number;
  link: string;
  status: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
  services: {
    name: string;
  };
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  admin_id: string | null;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  balance: number;
  is_admin: boolean;
  created_at: string;
}

const Admin = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [ticketReplies, setTicketReplies] = useState<Record<string, TicketReply[]>>({});
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error || !profileData?.is_admin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin panel.",
            variant: "destructive"
          });
          navigate("/dashboard");
          return;
        }

        setIsAdmin(true);
      } catch (error: any) {
        console.error("Admin access check error:", error);
        navigate("/auth");
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);

  useEffect(() => {
    if (!isAdmin) return;
    
    fetchData();

    // Set up real-time subscriptions for admin panel
    const ordersChannel = supabase
      .channel('admin-orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchData()
      )
      .subscribe();

    const depositsChannel = supabase
      .channel('admin-deposits-changes') 
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        () => fetchData()
      )
      .subscribe();

    const ticketsChannel = supabase
      .channel('admin-tickets-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => fetchData()
      )
      .subscribe();

    const repliesChannel = supabase
      .channel('admin-replies-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_replies' },
        (payload) => {
          const ticketId = payload.new.ticket_id;
          fetchTicketReplies(ticketId);
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
      depositsChannel.unsubscribe();
      ticketsChannel.unsubscribe();
      repliesChannel.unsubscribe();
      profilesChannel.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch deposits with user profiles
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles!deposits_user_id_fkey (email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (depositsError) {
        console.error("Deposits fetch error:", depositsError);
        throw depositsError;
      }

      // Fetch orders with user profiles and services
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey (email, full_name),
          services!orders_service_id_fkey (name)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error("Orders fetch error:", ordersError);
        throw ordersError;
      }

      // Fetch support tickets with user profiles
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_user_id_fkey (email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error("Tickets fetch error:", ticketsError);
        throw ticketsError;
      }

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error("Users fetch error:", usersError);
        throw usersError;
      }

      setDeposits(depositsData || []);
      setOrders(ordersData || []);
      setTickets(ticketsData || []);
      setUsers(usersData || []);
    } catch (error: any) {
      console.error("Fetch data error:", error);
      toast({
        title: "Error loading data",
        description: error.message || "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeposit = async (depositId: string, amount: number, userId: string, adminNotes?: string) => {
    try {
      // Get current admin user
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData?.user?.id;

      // Update deposit status to completed with verification details
      const { error: depositError } = await supabase
        .from('deposits')
        .update({ 
          status: 'completed',
          admin_notes: adminNotes || null,
          verified_by: adminId,
          verified_at: new Date().toISOString()
        })
        .eq('id', depositId);

      if (depositError) throw depositError;

      // Get current user balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: (profileData.balance || 0) + amount 
        })
        .eq('user_id', userId);

      if (balanceError) throw balanceError;

      toast({
        title: "Deposit approved",
        description: `$${amount} has been added to user's account.`,
      });

      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRejectDeposit = async (depositId: string, adminNotes?: string) => {
    try {
      // Get current admin user
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData?.user?.id;

      const { error } = await supabase
        .from('deposits')
        .update({ 
          status: 'failed',
          admin_notes: adminNotes || null,
          verified_by: adminId,
          verified_at: new Date().toISOString()
        })
        .eq('id', depositId);

      if (error) throw error;

      toast({
        title: "Deposit rejected",
        description: "Deposit has been rejected.",
      });

      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      // First update in database
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // Then update local state after successful DB update
      setOrders((current) => 
        current.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      toast({
        title: "Order updated",
        description: `Order status changed to ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      // Refresh to ensure consistency
      fetchData();
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Ticket updated",
        description: `Ticket status changed to ${status}.`,
      });

      fetchData(); // Refresh data
      setIsTicketDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchTicketReplies = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Ticket replies fetch error:", error);
        throw error;
      }

      setTicketReplies(prev => ({ ...prev, [ticketId]: data || [] }));
    } catch (error: any) {
      console.error("Fetch ticket replies error:", error);
      toast({
        title: "Error loading replies",
        description: error.message || "Failed to load ticket replies",
        variant: "destructive"
      });
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      // Get current authenticated admin user id to satisfy RLS
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const adminId = userData?.user?.id;
      if (!adminId) throw new Error("Not authenticated");

      // Optimistic UI update
      const optimisticReply: TicketReply = {
        id: crypto.randomUUID(),
        ticket_id: selectedTicket.id,
        user_id: null,
        admin_id: adminId,
        message: replyMessage,
        is_admin_reply: true,
        created_at: new Date().toISOString(),
        // @ts-expect-error updated_at not needed for UI
        updated_at: new Date().toISOString(),
      };
      setTicketReplies((prev) => ({
        ...prev,
        [selectedTicket.id]: [...(prev[selectedTicket.id] || []), optimisticReply],
      }));

      const { error } = await supabase
        .from('ticket_replies')
        .insert({
          ticket_id: selectedTicket.id,
          admin_id: adminId,
          user_id: null,
          message: replyMessage,
          is_admin_reply: true,
        });

      if (error) throw error;

      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the customer.",
      });

      setReplyMessage("");
      // Refresh to get canonical ordering and IDs
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

  const handleUpdateBalance = async () => {
    if (!selectedUser) return;

    try {
      const balanceValue = parseFloat(newBalance);
      if (isNaN(balanceValue) || balanceValue < 0) {
        toast({
          title: "Invalid balance",
          description: "Please enter a valid positive number",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ balance: balanceValue })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast({
        title: "Balance updated",
        description: `User balance has been updated to $${balanceValue.toFixed(2)}`,
      });

      setIsUserDialogOpen(false);
      setSelectedUser(null);
      setNewBalance("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openUserDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setNewBalance(user.balance.toString());
    setIsUserDialogOpen(true);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      pending: "secondary",
      "in progress": "secondary",
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      active: "default",
      open: "secondary",
      closed: "default"
    };
    
    return <Badge variant={statusColors[status] || "secondary"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage deposits, orders, and support tickets</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="deposits" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deposits">
              Deposits ({deposits.filter(d => d.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="tickets">
              Support ({tickets.filter(t => t.status === 'open').length})
            </TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="deposits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Requests</CardTitle>
                <CardDescription>
                  Review and approve/reject deposit requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deposits.map((deposit) => (
                    <div key={deposit.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{deposit.profiles?.full_name || deposit.profiles?.email}</span>
                            {getStatusBadge(deposit.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${deposit.amount} • {deposit.payment_method}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(deposit.created_at).toLocaleDateString()} {new Date(deposit.created_at).toLocaleTimeString()}
                          </p>
                          {deposit.transaction_id && (
                            <p className="text-xs text-muted-foreground">
                              Transaction ID: {deposit.transaction_id}
                            </p>
                          )}
                          {deposit.crypto_address && (
                            <p className="text-xs text-muted-foreground break-all">
                              Address: {deposit.crypto_address}
                            </p>
                          )}
                        </div>
                        {deposit.status === 'pending' && (
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Approve Deposit</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Amount: ${deposit.amount}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      User: {deposit.profiles?.full_name || deposit.profiles?.email}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Admin Notes (Optional)</label>
                                    <Textarea 
                                      id={`approve-notes-${deposit.id}`}
                                      placeholder="Add verification notes..."
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                  <Button 
                                    className="w-full"
                                    onClick={() => {
                                      const notes = (document.getElementById(`approve-notes-${deposit.id}`) as HTMLTextAreaElement)?.value;
                                      handleApproveDeposit(deposit.id, deposit.amount, deposit.user_id, notes);
                                      document.getElementById(`approve-notes-${deposit.id}`)?.closest('div[role="dialog"]')?.querySelector('button')?.click();
                                    }}
                                  >
                                    Confirm Approval
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Deposit</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Amount: ${deposit.amount}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      User: {deposit.profiles?.full_name || deposit.profiles?.email}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Reason for Rejection (Optional)</label>
                                    <Textarea 
                                      id={`reject-notes-${deposit.id}`}
                                      placeholder="Add rejection reason..."
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                  <Button 
                                    className="w-full"
                                    variant="destructive"
                                    onClick={() => {
                                      const notes = (document.getElementById(`reject-notes-${deposit.id}`) as HTMLTextAreaElement)?.value;
                                      handleRejectDeposit(deposit.id, notes);
                                      document.getElementById(`reject-notes-${deposit.id}`)?.closest('div[role="dialog"]')?.querySelector('button')?.click();
                                    }}
                                  >
                                    Confirm Rejection
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                      
                      {deposit.admin_notes && (
                        <div className="pt-2 border-t">
                          <p className="text-xs font-medium text-muted-foreground">Admin Notes:</p>
                          <p className="text-sm mt-1">{deposit.admin_notes}</p>
                          {deposit.verified_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Verified: {new Date(deposit.verified_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {deposits.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No deposit requests found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>View all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.profiles?.full_name || order.profiles?.email}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.services?.name} • {order.quantity} units • ${order.total_amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.link} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32 bg-card border">
                            <SelectValue placeholder={order.status} />
                          </SelectTrigger>
                          <SelectContent className="bg-card border shadow-lg z-50">
                            <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                            <SelectItem value="in progress" className="cursor-pointer">In Progress</SelectItem>
                            <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
                            <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No orders found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Customer support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticket.profiles?.full_name || ticket.profiles?.email}</span>
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
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.message}</p>
                      </div>
                    </div>
                  ))}

                  {tickets.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No support tickets found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ticket Reply Dialog */}
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
                          <span className="font-medium">
                            {selectedTicket.profiles?.full_name || selectedTicket.profiles?.email}
                          </span>
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
                              {reply.is_admin_reply ? 'Admin' : 'Customer'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{reply.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Form */}
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Select
                            value={selectedTicket.status}
                            onValueChange={(value) => handleUpdateTicketStatus(selectedTicket.id, value)}
                          >
                            <SelectTrigger className="w-32 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border shadow-lg">
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                          <Send className="h-4 w-4 mr-1" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user accounts and balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search users by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.full_name || user.email}</span>
                            {user.is_admin && <Badge variant="default">Admin</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm font-medium">Balance: ${user.balance.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUserDialog(user)}
                          >
                            Edit Balance
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {searchQuery ? "No users found matching your search." : "No users found."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Balance Edit Dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Update User Balance</DialogTitle>
                </DialogHeader>
                
                {selectedUser && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">User</p>
                      <p className="font-medium">{selectedUser.full_name || selectedUser.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Balance ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        placeholder="Enter new balance"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateBalance}>
                        Update Balance
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;