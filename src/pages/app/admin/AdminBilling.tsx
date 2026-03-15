import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const AdminBilling = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <CreditCard className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-bold">Billing</h1>
    </div>
    <Card className="p-12 text-center text-muted-foreground">
      Billing management will be available soon. During the beta period, all features are free.
    </Card>
  </div>
);

export default AdminBilling;
