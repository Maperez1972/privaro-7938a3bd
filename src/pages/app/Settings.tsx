import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const { user, profile } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Profile</h2>
        <div className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div>
            <Label>Full Name</Label>
            <Input value={profile?.full_name || ""} disabled />
          </div>
          <div>
            <Label>Organization ID</Label>
            <Input value={profile?.org_id || ""} disabled />
          </div>
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Preferences</h2>
        <p className="text-sm text-muted-foreground">Additional settings will be available soon.</p>
      </Card>
    </div>
  );
};

export default Settings;
