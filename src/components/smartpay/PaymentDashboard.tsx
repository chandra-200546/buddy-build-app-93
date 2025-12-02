import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Clock, CheckCircle2 } from "lucide-react";

interface PaymentDashboardProps {
  expenses: any[];
  members: any[];
}

const PaymentDashboard = ({ expenses, members }: PaymentDashboardProps) => {
  const { toast } = useToast();

  // Calculate payment summary for each member
  const paymentSummary = members.map(member => {
    let totalOwed = 0;
    let totalPaid = 0;
    let pendingCount = 0;
    let hasAnySplits = false;

    expenses.forEach(expense => {
      const split = expense.expense_splits?.find((s: any) => s.member_id === member.id);
      if (split) {
        hasAnySplits = true;
        if (split.is_paid) {
          totalPaid += parseFloat(split.share_amount);
        } else {
          totalOwed += parseFloat(split.share_amount);
          pendingCount++;
        }
      }
    });

    return {
      member,
      totalOwed,
      totalPaid,
      pendingCount,
      hasAnySplits,
    };
  });

  const handlePayNow = (memberId: string, amount: number) => {
    const upiId = "merchant@paytm";
    const name = "SmartPay";
    const note = "Group Travel Payment";
    
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    
    toast({
      title: "Opening Payment App",
      description: "Redirecting to PhonePe/UPI app...",
    });
    
    window.location.href = upiUrl;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hasAnyExpenses = expenses.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Payment Status
          </CardTitle>
          <CardDescription>Track who has paid and who owes money</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAnyExpenses ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No expenses yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add expenses to start tracking payments
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentSummary.map(({ member, totalOwed, totalPaid, pendingCount, hasAnySplits }) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <div className="flex gap-2 mt-1">
                        {totalOwed > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            ₹{totalOwed.toFixed(2)} pending
                          </Badge>
                        )}
                        {totalPaid > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ₹{totalPaid.toFixed(2)} paid
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!hasAnySplits ? (
                      <Badge variant="outline" className="text-muted-foreground border-border">
                        <Clock className="w-3 h-3 mr-1" />
                        No splits
                      </Badge>
                    ) : totalOwed > 0 ? (
                      <>
                        <div className="text-right">
                          <p className="text-lg font-bold text-destructive">₹{totalOwed.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{pendingCount} pending</p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handlePayNow(member.id, totalOwed)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Pay Now
                        </Button>
                      </>
                    ) : (
                      <Badge className="bg-green-600 text-white hover:bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        All Paid
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDashboard;