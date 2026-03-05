import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, Truck, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLoginCustomer } from "../hooks/useQueries";
import { loginAsAdmin, loginAsDriver } from "../utils/auth";
import { hashPassword } from "../utils/crypto";

export default function LoginPage() {
  const navigate = useNavigate();
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverPassword, setDriverPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const loginMutation = useLoginCustomer();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (adminUsername === "admin" && adminPassword === "admin123") {
      loginAsAdmin();
      toast.success("Welcome back, Admin!");
      navigate({ to: "/admin" });
    } else {
      toast.error("Invalid admin credentials");
    }
    setAdminLoading(false);
  };

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim() || !driverPassword.trim()) {
      toast.error("Please enter vehicle number and password");
      return;
    }
    try {
      const hash = await hashPassword(driverPassword);
      const result = await loginMutation.mutateAsync({
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        passwordHash: hash,
      });
      if (result.success && result.vehicleId) {
        loginAsDriver(result.vehicleId, vehicleNumber.trim().toUpperCase());
        toast.success("Login successful!");
        navigate({ to: "/driver" });
      } else {
        toast.error("Invalid vehicle number or password");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        {/* Logo area */}
        <div className="mb-8 flex flex-col items-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-2xl glow-blue flex items-center justify-center mb-4 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.22 250), oklch(0.55 0.24 260))",
            }}
          >
            <img
              src="/assets/generated/fleetyfy-logo-transparent.dim_120x120.png"
              alt="Fleetyfy"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="font-display text-4xl font-black text-gradient-blue tracking-tight">
            Fleetyfy
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium tracking-widest uppercase">
            Fleet Management
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="w-1.5 h-1.5 rounded-full bg-fleet-green animate-pulse" />
            <span className="text-xs text-muted-foreground">
              United Mission Corporation
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="card-gradient rounded-2xl p-6 shadow-card-elevated">
            <Tabs defaultValue="driver">
              <TabsList className="w-full mb-6 bg-fleet-dark-2 rounded-xl h-11">
                <TabsTrigger
                  value="driver"
                  className="flex-1 gap-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
                  data-ocid="login.driver_tab"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Driver
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="flex-1 gap-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg"
                  data-ocid="login.admin_tab"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* Driver Login */}
              <TabsContent value="driver">
                <form onSubmit={handleDriverLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Vehicle Number
                    </Label>
                    <Input
                      placeholder="e.g. OD02AB1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="input-dark h-11 font-mono text-base uppercase"
                      autoComplete="username"
                      data-ocid="login.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={driverPassword}
                      onChange={(e) => setDriverPassword(e.target.value)}
                      className="input-dark h-11"
                      autoComplete="current-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 btn-primary font-semibold text-sm mt-2"
                    disabled={loginMutation.isPending}
                    data-ocid="login.submit_button"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 mr-2" />
                        Login as Driver
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Login */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Username
                    </Label>
                    <Input
                      placeholder="Admin username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="input-dark h-11"
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="input-dark h-11"
                      autoComplete="current-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold text-sm mt-2"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.17 75), oklch(0.48 0.19 60))",
                    }}
                    disabled={adminLoading}
                    data-ocid="login.submit_button"
                  >
                    {adminLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Login as Admin
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Contact info */}
          <div className="mt-4 p-3 rounded-xl bg-fleet-dark-2/60 border border-border/50 text-center space-y-0.5">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <User className="w-3 h-3" />
              Vedanta Road, Jharsuguda 768201
            </p>
            <p className="text-xs text-muted-foreground">
              📞 7735665622 · unitedmissioncorporation.jsg@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 px-6">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fleet-blue hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
