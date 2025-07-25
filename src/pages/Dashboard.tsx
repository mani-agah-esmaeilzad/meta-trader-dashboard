import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  LogOut,
  Wallet,
  PieChart,
  BarChart3,
  History,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for API data
interface AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
  currency: string;
}

interface Position {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: string;
}

interface HistoryTrade {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  openTime: string;
  closeTime: string;
}

interface SymbolSummary {
  symbol: string;
  netVolume: number;
  netType: 'BUY' | 'SELL' | 'NEUTRAL';
  totalProfit: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Demo data - replace with actual API calls
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    balance: 10000.00,
    equity: 10250.50,
    margin: 1500.00,
    freeMargin: 8750.50,
    marginLevel: 683.37,
    profit: 250.50,
    currency: 'USD'
  });

  const [positions, setPositions] = useState<Position[]>([
    {
      ticket: 123456,
      symbol: 'XAUUSD',
      type: 'BUY',
      volume: 0.10,
      openPrice: 2025.50,
      currentPrice: 2028.75,
      profit: 32.50,
      swap: -5.20,
      commission: -10.00,
      openTime: '2024-01-15 10:30:00'
    },
    {
      ticket: 123457,
      symbol: 'EURUSD',
      type: 'SELL',
      volume: 0.50,
      openPrice: 1.0850,
      currentPrice: 1.0845,
      profit: 25.00,
      swap: -2.50,
      commission: -5.00,
      openTime: '2024-01-15 14:15:00'
    }
  ]);

  const [historyTrades, setHistoryTrades] = useState<HistoryTrade[]>([
    {
      ticket: 123450,
      symbol: 'GBPUSD',
      type: 'BUY',
      volume: 0.30,
      openPrice: 1.2650,
      closePrice: 1.2680,
      profit: 90.00,
      openTime: '2024-01-14 09:00:00',
      closeTime: '2024-01-14 15:30:00'
    }
  ]);

  // Calculate symbol summaries
  const symbolSummaries = (): SymbolSummary[] => {
    const summaries: { [key: string]: SymbolSummary } = {};
    
    positions.forEach(pos => {
      if (!summaries[pos.symbol]) {
        summaries[pos.symbol] = {
          symbol: pos.symbol,
          netVolume: 0,
          netType: 'NEUTRAL',
          totalProfit: 0
        };
      }
      
      const volume = pos.type === 'BUY' ? pos.volume : -pos.volume;
      summaries[pos.symbol].netVolume += volume;
      summaries[pos.symbol].totalProfit += pos.profit;
    });

    return Object.values(summaries).map(summary => ({
      ...summary,
      netType: summary.netVolume > 0 ? 'BUY' : summary.netVolume < 0 ? 'SELL' : 'NEUTRAL',
      netVolume: Math.abs(summary.netVolume)
    }));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls
      // await Promise.all([
      //   fetch('/api/account/info'),
      //   fetch('/api/positions'),
      //   fetch('/api/history')
      // ]);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdate(new Date());
      
      toast({
        title: "به‌روزرسانی موفق",
        description: "اطلاعات به‌روزرسانی شد"
      });
    } catch (error) {
      toast({
        title: "خطا در به‌روزرسانی",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mtAuth');
    navigate('/');
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    return volume.toFixed(2);
  };

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('mtAuth');
    if (!auth || !JSON.parse(auth).isAuthenticated) {
      navigate('/');
      return;
    }

    // Set up real-time updates (replace with WebSocket)
    const interval = setInterval(() => {
      // TODO: Replace with WebSocket connection
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">داشبورد MetaTrader</h1>
          <p className="text-muted-foreground">
            آخرین به‌روزرسانی: {lastUpdate.toLocaleTimeString('fa-IR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            به‌روزرسانی
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 ml-2" />
            خروج
          </Button>
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">بالانس</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accountInfo.balance, accountInfo.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accountInfo.equity, accountInfo.currency)}
            </div>
            <p className={`text-xs ${accountInfo.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
              {accountInfo.profit >= 0 ? '+' : ''}{formatCurrency(accountInfo.profit, accountInfo.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مارجین</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accountInfo.margin, accountInfo.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              آزاد: {formatCurrency(accountInfo.freeMargin, accountInfo.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سطح مارجین</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountInfo.marginLevel.toFixed(2)}%
            </div>
            <Badge 
              variant={accountInfo.marginLevel > 200 ? "default" : "destructive"}
              className="mt-1"
            >
              {accountInfo.marginLevel > 200 ? 'ایمن' : 'خطرناک'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positions Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              خلاصه پوزیشن‌ها
            </CardTitle>
            <CardDescription>
              خلاصه‌ای از پوزیشن‌های باز به تفکیک نماد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {symbolSummaries().map((summary) => (
                <div key={summary.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">{summary.symbol}</div>
                    <Badge 
                      variant={summary.netType === 'BUY' ? "default" : summary.netType === 'SELL' ? "destructive" : "secondary"}
                    >
                      {summary.netType === 'BUY' ? 'خرید' : summary.netType === 'SELL' ? 'فروش' : 'خنثی'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatVolume(summary.netVolume)} لات
                    </span>
                  </div>
                  <div className={`font-bold ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {summary.totalProfit >= 0 ? '+' : ''}{formatCurrency(summary.totalProfit)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              پوزیشن‌های باز
            </CardTitle>
            <CardDescription>
              لیست کامل معاملات فعال
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {positions.map((position) => (
                <div key={position.ticket} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{position.symbol}</span>
                      <Badge variant={position.type === 'BUY' ? "default" : "destructive"}>
                        {position.type === 'BUY' ? 'خرید' : 'فروش'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatVolume(position.volume)} لات
                      </span>
                    </div>
                    <div className={`font-bold ${position.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {position.profit >= 0 ? '+' : ''}{formatCurrency(position.profit)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <span>قیمت باز: {position.openPrice}</span>
                    <span>قیمت فعلی: {position.currentPrice}</span>
                    <span>تیکت: #{position.ticket}</span>
                    <span>زمان: {position.openTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            تاریخچه معاملات
          </CardTitle>
          <CardDescription>
            معاملات بسته شده اخیر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {historyTrades.map((trade) => (
              <div key={trade.ticket} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{trade.symbol}</span>
                    <Badge variant={trade.type === 'BUY' ? "default" : "destructive"}>
                      {trade.type === 'BUY' ? 'خرید' : 'فروش'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatVolume(trade.volume)} لات
                    </span>
                  </div>
                  <div className={`font-bold ${trade.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-3 gap-2 mt-2">
                  <span>باز: {trade.openPrice}</span>
                  <span>بسته: {trade.closePrice}</span>
                  <span>تیکت: #{trade.ticket}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;