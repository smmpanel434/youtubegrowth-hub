import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle
} from "lucide-react";
import DepositModal from "@/components/DepositModal";
import OrderModal from "@/components/OrderModal";
import SupportTicketModal from "@/components/SupportTicketModal";

interface Order {
  id: string;
  service_id: string;
  quantity: number;
  link: string;
  total_amount: number;
  status: string;
  created_at: string;
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

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
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
    }
  }, [user]);

  const calculateStats = async () => {
    if (!user) return;

    // Get orders stats
    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('user_id', user.id);

    // Get deposits stats  
    const { data: depositsData } = await supabase
      .from('deposits')
      .select('amount, status')
      .eq('user_id', user.id);

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
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        services (name)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
  };

  const fetchDeposits = async () => {
    const { data } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setDeposits(data);
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
      processing: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
      failed: "bg-red-500"
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
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
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{order.services.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.quantity} units • {order.link}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total_amount}</p>
                          {getStatusBadge(order.status)}
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
                <CardTitle>Support Center</CardTitle>
                <CardDescription>Get help with payments, orders, or services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-1">Payment Issues</h3>
                    <p className="text-sm text-muted-foreground">Problems with deposits or billing</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-1">Order Problems</h3>
                    <p className="text-sm text-muted-foreground">Issues with service delivery</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-1">General Support</h3>
                    <p className="text-sm text-muted-foreground">Questions about our services</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setShowSupportModal(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Support Ticket
                </Button>
              </CardContent>
            </Card>
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
        }}
      />
    </div>
  );
};

export default Dashboard;