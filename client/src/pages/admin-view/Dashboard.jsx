import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../store/shop/order-slice"; // Use existing slice
import AdminOrders from "../../components/admin-view/Orders";
import TestEmail from "../../components/admin-view/TestEmail";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { orders, isLoading } = useSelector((state) => state.shopOrder); // Use existing orders

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/auth/login");
      return;
    }
    // Fetch orders using existing slice
    dispatch(fetchAllOrders());
  }, [isAuthenticated, user, navigate, dispatch]);

  // Calculate stats from existing orders data
  const dashboardStats = {
    // Core metrics
    totalOrders: orders?.length || 0, // Number of order documents
    // FIX: Convert ObjectId to string for proper deduplication
    activeCustomers: orders?.length > 0 
      ? [...new Set(orders.map(order => 
          (order.userId?._id || order.userId)?.toString()
        ).filter(Boolean))].length 
      : 0,
    totalRevenue:
      orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0,
    // Additional useful metrics
    totalItemsSold:
      orders?.reduce(
        (total, order) =>
          total +
          order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      ) || 0,
    averageOrderValue:
      orders?.length > 0
        ? (
            orders.reduce((sum, order) => sum + order.totalAmount, 0) /
            orders.length
          ).toFixed(2)
        : 0,
  };

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {dashboardStats.totalItemsSold}
            </p>
            <p className="text-sm text-gray-500">Total products sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardStats.totalOrders}</p>
            <p className="text-sm text-gray-500">Order transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {dashboardStats.activeCustomers}
            </p>
            <p className="text-sm text-gray-500">Unique buyers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{dashboardStats.totalRevenue}</p>
            <p className="text-sm text-gray-500">Total earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Banner Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/admin/banners")}
              className="w-full flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Manage Banners
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <AdminOrders />
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <TestEmail />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

// client/src/pages/admin-view/Dashboard.jsx