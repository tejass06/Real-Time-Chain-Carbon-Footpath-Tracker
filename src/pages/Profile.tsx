import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { apiFetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Award, Zap, TrendingUp } from "lucide-react";

type CompanyProfile = {
  id: number;
  name: string;
  industry: string;
  carbon_credits: number;
  carbon_credits_redeemed: number;
  created_at: string;
};

type CreditRecord = {
  id: number;
  company_id: number;
  trip_id: number | null;
  credits: number;
  reason: string;
  redeemed: boolean;
  created_at: string;
};

type CarbonCreditsData = {
  available_credits: number;
  redeemed_credits: number;
  total_available: number;
  recent_credits: CreditRecord[];
};

const Profile = () => {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [credits, setCredits] = useState<CarbonCreditsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);

    try {
      const [companyData, creditsData] = await Promise.all([
        apiFetchJson<CompanyProfile>("/company/profile/1"),
        apiFetchJson<CarbonCreditsData>("/carbon-credits/1"),
      ]);

      setCompany(companyData);
      setCredits(creditsData);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRedeemMessage(null);

    const amount = Number(redeemAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setRedeemMessage("Please enter a valid amount.");
      return;
    }

    if (credits && amount > credits.available_credits) {
      setRedeemMessage("Insufficient credits to redeem.");
      return;
    }

    try {
      const response = await apiFetchJson("/carbon-credits/1/redeem", {
        method: "POST",
        body: JSON.stringify({ credits_to_redeem: amount }),
      });

      setRedeemMessage(response.message || "Credits redeemed successfully!");
      setRedeemAmount("");
      await loadProfile();
    } catch (error) {
      setRedeemMessage("Unable to redeem credits at this moment.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Company Profile</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage your carbon credits and sustainability performance</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading profile...</div>
        ) : company ? (
          <>
            {/* Company Info Section */}
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              <div className="glass-card rounded-2xl border border-emerald/10 p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{company.name}</p>
                <p className="mt-2 text-sm text-emerald">Industry: {company.industry}</p>
              </div>

              <div className="glass-card rounded-2xl border border-emerald/10 p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="glass-card rounded-2xl border border-emerald/10 p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">Total CO2 Reduced</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">-- kg</p>
              </div>
            </div>

            {/* Carbon Credit System */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-6">Carbon Credit System</h2>

              {/* Credits Overview */}
              <div className="grid gap-6 mb-8 sm:grid-cols-3">
                <div className="glass-card rounded-2xl border border-emerald/10 p-6 shadow-soft hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Available Credits</span>
                    <Zap className="h-5 w-5 text-emerald" />
                  </div>
                  <p className="text-3xl font-bold text-emerald">
                    {credits?.available_credits.toFixed(2) || "0.00"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Ready to use or redeem</p>
                </div>

                <div className="glass-card rounded-2xl border border-emerald/10 p-6 shadow-soft hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Redeemed Credits</span>
                    <Award className="h-5 w-5 text-emerald" />
                  </div>
                  <p className="text-3xl font-bold text-emerald">
                    {credits?.redeemed_credits.toFixed(2) || "0.00"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Total redeemed</p>
                </div>

                <div className="glass-card rounded-2xl border border-emerald/10 p-6 shadow-soft hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Earned</span>
                    <TrendingUp className="h-5 w-5 text-emerald" />
                  </div>
                  <p className="text-3xl font-bold text-emerald">
                    {credits?.total_available.toFixed(2) || "0.00"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">All-time credits</p>
                </div>
              </div>

              {/* Redeem Credits */}
              <div className="glass-card rounded-2xl border border-emerald/10 p-6 shadow-soft mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Redeem Credits</h3>
                <form className="space-y-4" onSubmit={handleRedeem}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      value={redeemAmount}
                      onChange={(event) => setRedeemAmount(event.target.value)}
                      placeholder="Amount to redeem"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                    <Button type="submit" variant="hero">
                      Redeem
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max available: {credits?.available_credits.toFixed(2) || "0.00"} credits
                  </p>
                  {redeemMessage ? (
                    <p className="text-sm text-emerald">{redeemMessage}</p>
                  ) : null}
                </form>
              </div>

              {/* Recent Credits */}
              <div className="glass-card rounded-2xl border border-emerald/10 p-6 shadow-soft">
                <h3 className="text-xl font-semibold text-foreground mb-4">Recent Credits</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-4">Reason</th>
                        <th className="py-2 pr-4">Credits</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      {credits?.recent_credits && credits.recent_credits.length > 0 ? (
                        credits.recent_credits.map((credit) => (
                          <tr key={credit.id} className="border-t border-emerald/10">
                            <td className="py-3 pr-4">{credit.reason}</td>
                            <td className="py-3 pr-4 font-semibold text-emerald">
                              +{credit.credits.toFixed(2)}
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  credit.redeemed
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-emerald-100 text-emerald-900"
                                }`}
                              >
                                {credit.redeemed ? "Redeemed" : "Available"}
                              </span>
                            </td>
                            <td className="py-3">
                              {new Date(credit.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-sm text-muted-foreground">
                            No credits yet. Create trips with eco-friendly vehicles to earn credits!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load profile. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
