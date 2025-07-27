import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
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

const REFRESH_INTERVAL = 15000; // Auto-refresh every 15 seconds

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [historyTrades, setHistoryTrades] = useState<HistoryTrade[]>([]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('mtAuth');
    navigate('/');
  }, [navigate]);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) {
        setIsRefreshing(true);
    }
    
    try {
      const auth = localStorage.getItem('mtAuth');
      const token = auth ? JSON.parse(auth).token : null;
      if (!token) {
        handleLogout();
        return;
      }
      const headers = { 'Authorization': `Bearer ${token}` };

      const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = new Date().toISOString();

      const [accountInfoRes, positionsRes, historyRes] = await Promise.all([
        fetch('/api/account/info', { headers }),
        fetch('/api/positions', { headers }),
        fetch(`/api/history/trades?from_date=${fromDate}&to_date=${toDate}`, { headers })
      ]);

      if ([accountInfoRes, positionsRes, historyRes].some(res => res.status === 401)) {
          toast({ title: "Your session has expired", description: "Please log in again.", variant: "destructive" });
          handleLogout();
          return;
      }
      
      if (!accountInfoRes.ok || !positionsRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const accountInfoData = await accountInfoRes.json();
      const positionsData = await positionsRes.json();
      const historyData = await historyRes.json();

      setAccountInfo(accountInfoData.data);
      setPositions(positionsData.data);
      setHistoryTrades(historyData.data);
      setLastUpdate(new Date());

    } catch (error) {
      console.error("Fetch data error:", error);
      if (isInitialLoad) {
        toast({
          title: "Error fetching data",
          description: "Could not connect to the server.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [navigate, toast, handleLogout]);

  // Effect for initial data load
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Effect for auto-refreshing data every 15 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);
  
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

  const handleRefresh = () => {
    fetchData().then(() => {
        toast({
            title: "Refresh successful",
            description: "Data has been updated successfully."
        });
    });
  };

  const formatCurrency = (amount: number | undefined, currency: string = 'USD') => {
    if (typeof amount !== 'number') return '...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    return volume.toFixed(2);
  };
  
  if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin mr-4" />
            Loading account data...
        </div>
      );
  }

  if (!accountInfo) {
      return (
          <div className="min-h-screen flex items-center justify-center text-center p-4">
              <div>
                <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Data</h2>
                <p className="text-muted-foreground mb-6">Could not connect to the server. Please ensure the Python server and MetaTrader terminal are running.</p>
                <Button onClick={() => fetchData(true)}>Try Again</Button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MetaTrader Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString('fa-IR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 ml-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cards remain the same */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
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
            <p className={`text-xs ${accountInfo.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {accountInfo.profit >= 0 ? '+' : ''}{formatCurrency(accountInfo.profit, accountInfo.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accountInfo.margin, accountInfo.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Free: {formatCurrency(accountInfo.freeMargin, accountInfo.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Level</CardTitle>
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
              {accountInfo.marginLevel > 200 ? 'Safe' : 'Danger'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Positions Summary
            </CardTitle>
            <CardDescription>
              Summary of open positions by symbol
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
                      {summary.netType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatVolume(summary.netVolume)} lot
                    </span>
                  </div>
                  <div className={`font-bold ${summary.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {summary.totalProfit >= 0 ? '+' : ''}{formatCurrency(summary.totalProfit)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Open Positions
            </CardTitle>
            <CardDescription>
              Complete list of active trades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {positions.map((position) => (
                <div key={position.ticket} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{position.symbol}</span>
                      <Badge variant={position.type === 'BUY' ? "default" : "destructive"}>
                        {position.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatVolume(position.volume)} lot
                      </span>
                    </div>
                    <div className={`font-bold ${position.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {position.profit >= 0 ? '+' : ''}{formatCurrency(position.profit)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <span>Open Price: {position.openPrice}</span>
                    <span>Current Price: {position.currentPrice}</span>
                    <span>Ticket: #{position.ticket}</span>
                    <span>Time: {new Date(position.openTime).toLocaleString('fa-IR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Trading History
          </CardTitle>
          <CardDescription>
            Closed trades from the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {historyTrades.map((trade) => (
              <div key={trade.ticket} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{trade.symbol}</span>
                    <Badge variant={trade.type === 'BUY' ? "default" : "destructive"}>
                      {trade.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatVolume(trade.volume)} lot
                    </span>
                  </div>
                  <div className={`font-bold ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-3 gap-2 mt-2">
                  <span>Open: {trade.openPrice}</span>
                  <span>Close: {trade.closePrice}</span>
                  <span>Ticket: #{trade.ticket}</span>
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