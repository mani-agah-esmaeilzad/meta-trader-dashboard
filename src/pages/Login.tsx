import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Shield, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    password: "",
    server: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const servers = [
    "MetaQuotes-Demo",
    "ICMarkets-Live01",
    "ICMarkets-Live02", 
    "FXTM-Real",
    "FXTM-Demo",
    "Exness-Real",
    "Exness-Demo"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountNumber || !formData.password || !formData.server) {
      toast({
        title: "خطا",
        description: "لطفاً تمامی فیلدها را پر کنید",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store login data in localStorage for demo
      localStorage.setItem('mtAuth', JSON.stringify({
        accountNumber: formData.accountNumber,
        server: formData.server,
        isAuthenticated: true
      }));

      toast({
        title: "ورود موفق",
        description: "به داشبورد MetaTrader خوش آمدید"
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "خطا در ورود",
        description: "لطفاً اطلاعات ورود را بررسی کنید",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">MetaTrader Hub</h1>
          </div>
          <p className="text-muted-foreground">
            به پلتفرم معاملاتی خود وارد شوید
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">ورود به حساب</CardTitle>
            <CardDescription className="text-center">
              اطلاعات حساب MetaTrader خود را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  شماره حساب (کابین)
                </Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="مثال: 12345678"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  سرور MetaTrader
                </Label>
                <Select onValueChange={(value) => handleInputChange('server', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="سرور خود را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.map((server) => (
                      <SelectItem key={server} value={server}>
                        {server}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "در حال ورود..." : "ورود به داشبورد"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            اطلاعات شما با رمزگذاری SSL محافظت می‌شود
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;