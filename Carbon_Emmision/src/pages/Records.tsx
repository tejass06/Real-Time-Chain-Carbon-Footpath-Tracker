import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";
import { apiFetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  FileText,
  TrendingDown,
  Calendar,
  Activity,
  AlertCircle,
} from "lucide-react";

type DailyFootprint = {
  date: string;
  co2: number;
};

type MonthlyFootprint = {
  month: string;
  year: number;
  total_co2: number;
};

type DailyTrend = {
  date: string;
  co2: number;
};

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#5eead4"];

const Records = () => {
  const [dailyFootprint, setDailyFootprint] = useState<DailyFootprint[]>([]);
  const [monthlyFootprint, setMonthlyFootprint] = useState<MonthlyFootprint[]>(
    []
  );
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDailyCO2, setTotalDailyCO2] = useState(0);
  const [totalMonthlyCO2, setTotalMonthlyCO2] = useState(0);
  const [averageDailyCO2, setAverageDailyCO2] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [daily, monthly, trend] = await Promise.all([
        apiFetchJson<DailyFootprint[]>("/footprint/daily/all"),
        apiFetchJson<MonthlyFootprint[]>("/footprint/monthly/all"),
        apiFetchJson<DailyTrend[]>("/footprint/daily/trend"),
      ]);

      console.log("Daily data:", daily);
      console.log("Monthly data:", monthly);
      console.log("Trend data:", trend);

      setDailyFootprint(daily || []);
      setMonthlyFootprint(monthly || []);
      setDailyTrend(trend || []);

      // Calculate total daily CO2
      const totalDaily = daily?.reduce((sum, item) => sum + item.co2, 0) || 0;
      setTotalDailyCO2(totalDaily);
      setAverageDailyCO2(
        daily && daily.length > 0 ? totalDaily / daily.length : 0
      );

      // Calculate total monthly CO2
      const totalMonthly =
        monthly?.reduce((sum, item) => sum + item.total_co2, 0) || 0;
      setTotalMonthlyCO2(totalMonthly);

      if (!daily || daily.length === 0) {
        setError("No daily footprint data found. Please add some trips first.");
      }
    } catch (error) {
      console.error("Failed to load records:", error);
      setError(`Failed to load records: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = (
    fileName: string,
    data: (DailyFootprint | MonthlyFootprint)[]
  ) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Determine headers based on data type
    const isDaily = "date" in data[0];
    const headers = isDaily
      ? ["Date", "CO₂ (kg)"]
      : ["Month", "Year", "Total CO₂ (kg)"];

    // Create CSV content
    let csv = headers.join(",") + "\n";

    data.forEach((row: any) => {
      if (isDaily) {
        csv += `${row.date},${row.co2}\n`;
      } else {
        csv += `${row.month},${row.year},${row.total_co2}\n`;
      }
    });

    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (
    fileName: string,
    data: (DailyFootprint | MonthlyFootprint)[],
    title: string
  ) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Create HTML table
    const isDaily = "date" in data[0];
    let html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #10b981; margin-bottom: 20px; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            thead {
              background-color: #10b981;
              color: white;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .summary {
              margin-top: 30px;
              padding: 15px;
              background-color: #f3f4f6;
              border-left: 4px solid #10b981;
            }
            .summary h3 { margin-top: 0; color: #10b981; }
            .timestamp {
              color: #666;
              font-size: 12px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <thead>
              <tr>
                ${isDaily ? "<th>Date</th><th>CO₂ (kg)</th>" : "<th>Month</th><th>Year</th><th>Total CO₂ (kg)</th>"}
              </tr>
            </thead>
            <tbody>
              ${data
                .map((row: any) => {
                  if (isDaily) {
                    return `<tr><td>${row.date}</td><td>${row.co2.toFixed(2)}</td></tr>`;
                  } else {
                    return `<tr><td>${row.month}</td><td>${row.year}</td><td>${row.total_co2.toFixed(2)}</td></tr>`;
                  }
                })
                .join("")}
            </tbody>
          </table>
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Records:</strong> ${data.length}</p>
            <p><strong>Total CO₂ Emissions:</strong> ${data.reduce((sum: number, item: any) => sum + (item.co2 || item.total_co2), 0).toFixed(2)} kg</p>
            <p><strong>Average CO₂:</strong> ${(data.reduce((sum: number, item: any) => sum + (item.co2 || item.total_co2), 0) / data.length).toFixed(2)} kg</p>
            <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    // Create and open print window
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/90" />

        <div className="relative container mx-auto px-4 pt-24 pb-12 max-w-7xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
              <FileText className="w-10 h-10 text-emerald-400" />
              Footprint Records
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              View and export your daily and monthly carbon emission records
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="bg-red-500/10 border-red-500/30 shadow-soft p-4 mb-8">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </Card>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Daily Total CO₂
                  </p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {totalDailyCO2.toFixed(1)} <span className="text-lg">kg</span>
                  </p>
                </div>
                <Activity className="w-10 h-10 text-emerald-400/50" />
              </div>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Average Daily CO₂
                  </p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {averageDailyCO2.toFixed(1)} <span className="text-lg">kg</span>
                  </p>
                </div>
                <TrendingDown className="w-10 h-10 text-emerald-400/50" />
              </div>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Monthly Total CO₂
                  </p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {totalMonthlyCO2.toFixed(1)} <span className="text-lg">kg</span>
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-emerald-400/50" />
              </div>
            </Card>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading records...
            </div>
          ) : (
            <>
              {/* Daily Footprint Section */}
              <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    Daily Footprint
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/30 border-emerald/30 text-emerald-400 hover:bg-emerald/10 gap-2"
                      onClick={() =>
                        exportToCSV("daily-footprint", dailyFootprint)
                      }
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/30 border-emerald/30 text-emerald-400 hover:bg-emerald/10 gap-2"
                      onClick={() =>
                        exportToPDF(
                          "daily-footprint",
                          dailyFootprint,
                          "Daily Carbon Footprint Report"
                        )
                      }
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                </div>

                {dailyFootprint.length > 0 ? (
                  <>
                    <div className="mb-6 bg-black/20 rounded-lg p-4 border border-emerald/10">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyFootprint}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #10b981",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#10b981" }}
                          />
                          <Bar dataKey="co2" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-white">
                        <thead className="text-xs uppercase text-emerald-400 border-b border-emerald/20">
                          <tr>
                            <th className="py-3 pr-4">Date</th>
                            <th className="py-3 pr-4">CO₂ Emissions (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyFootprint.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-t border-emerald/10 hover:bg-emerald/5 transition-colors"
                            >
                              <td className="py-3 pr-4">{item.date}</td>
                              <td className="py-3 pr-4">
                                <span className="text-emerald-400 font-semibold">
                                  {item.co2.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No daily footprint data available
                  </div>
                )}
              </Card>

              {/* Daily Trend Section */}
              {dailyTrend.length > 0 && (
                <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6 mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-emerald-400" />
                    7-Day Trend Analysis
                  </h2>

                  <div className="bg-black/20 rounded-lg p-4 border border-emerald/10">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #10b981",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#10b981" }}
                        />
                        <Legend wrapperStyle={{ color: "#888" }} />
                        <Line
                          type="monotone"
                          dataKey="co2"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Daily CO₂ (kg)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Monthly Footprint Section */}
              <Card className="bg-black/40 backdrop-blur-md border-emerald/20 shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-emerald-400" />
                    Monthly Footprint
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/30 border-emerald/30 text-emerald-400 hover:bg-emerald/10 gap-2"
                      onClick={() =>
                        exportToCSV("monthly-footprint", monthlyFootprint)
                      }
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/30 border-emerald/30 text-emerald-400 hover:bg-emerald/10 gap-2"
                      onClick={() =>
                        exportToPDF(
                          "monthly-footprint",
                          monthlyFootprint,
                          "Monthly Carbon Footprint Report"
                        )
                      }
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                </div>

                {monthlyFootprint.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Pie Chart */}
                      <div className="bg-black/20 rounded-lg p-4 border border-emerald/10">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={monthlyFootprint}
                              dataKey="total_co2"
                              nameKey="month"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {monthlyFootprint.map((_, idx) => (
                                <Cell
                                  key={`cell-${idx}`}
                                  fill={COLORS[idx % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1a1a1a",
                                border: "1px solid #10b981",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "#10b981" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Bar Chart */}
                      <div className="bg-black/20 rounded-lg p-4 border border-emerald/10">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={monthlyFootprint}
                            layout="vertical"
                            margin={{ left: 80 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis type="number" stroke="#888" />
                            <YAxis
                              dataKey="month"
                              type="category"
                              stroke="#888"
                              width={80}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1a1a1a",
                                border: "1px solid #10b981",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "#10b981" }}
                            />
                            <Bar
                              dataKey="total_co2"
                              fill="#10b981"
                              radius={[0, 8, 8, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Monthly Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-white">
                        <thead className="text-xs uppercase text-emerald-400 border-b border-emerald/20">
                          <tr>
                            <th className="py-3 pr-4">Month</th>
                            <th className="py-3 pr-4">Year</th>
                            <th className="py-3 pr-4">Total CO₂ (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyFootprint.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-t border-emerald/10 hover:bg-emerald/5 transition-colors"
                            >
                              <td className="py-3 pr-4">{item.month}</td>
                              <td className="py-3 pr-4">{item.year}</td>
                              <td className="py-3 pr-4">
                                <span className="text-emerald-400 font-semibold">
                                  {item.total_co2.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No monthly footprint data available
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
