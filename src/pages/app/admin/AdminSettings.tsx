import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

const AdminSettings = () => {
  const { profile } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Organization</h2>
        <div>
          <Label>Organization ID</Label>
          <Input value={profile?.org_id || ""} disabled />
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Security</h2>
        <p className="text-sm text-muted-foreground">Advanced security settings (MFA enforcement, session policies) coming soon.</p>
      </Card>
    </div>
  );
};

export default AdminSettings;
