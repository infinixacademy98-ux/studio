
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where, orderBy, Timestamp, limit } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import type { Business, Message, UserDoc } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Users, Clock, MailCheck, Eye } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingApprovals: 0,
    newSignups: 0,
    totalMessages: 0,
  });
  const [recentListings, setRecentListings] = useState<Business[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/admin/signin");
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchDashboardData = async () => {
        setLoadingStats(true);
        try {
          // Fetch Listings
          const listingsQuery = query(collection(db, "listings"));
          const listingsSnapshot = await getDocs(listingsQuery);
          const listingsData = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
          const totalBusinesses = listingsData.length;
          const pendingApprovals = listingsData.filter(l => l.status === 'pending').length;

          // Fetch Users
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const usersQuery = query(collection(db, "users"), where("createdAt", ">", oneWeekAgo));
          const usersSnapshot = await getDocs(usersQuery);
          const newSignups = usersSnapshot.size;

          // Fetch Messages
          const messagesQuery = query(collection(db, "messages"));
          const messagesSnapshot = await getDocs(messagesQuery);
          const totalMessages = messagesSnapshot.size;

          setStats({
            totalBusinesses,
            pendingApprovals,
            newSignups,
            totalMessages
          });

          // Fetch recent pending listings
          const recentListingsQuery = query(
            collection(db, "listings"),
            where("status", "==", "pending")
          );
          const recentListingsSnapshot = await getDocs(recentListingsQuery);
          const recentListingsData = recentListingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt,
          } as Business))
          .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
          .slice(0, 5);
          
          setRecentListings(recentListingsData);

        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchDashboardData();
    }
  }, [isAdmin]);

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) {
      return "N/A";
    }
    return format(timestamp.toDate(), "PPpp");
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Businesses", value: stats.totalBusinesses, icon: Building2 },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: Clock },
    { title: "New Sign-ups (7d)", value: stats.newSignups, icon: Users },
    { title: "Total Messages", value: stats.totalMessages, icon: MailCheck },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-2xl font-bold tracking-tight mb-4">Recent Pending Listings</h3>
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStats ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : recentListings.length > 0 ? (
                    recentListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">{listing.name}</TableCell>
                        <TableCell>{listing.category}</TableCell>
                        <TableCell>{formatDate(listing.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href="/admin/businesses">
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                        No pending listings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
