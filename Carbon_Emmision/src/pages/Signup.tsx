import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Building2, Briefcase } from "lucide-react";
import { apiFetchJson } from "@/lib/api";

type SignupResponse = {
  user: {
    id: number;
    email: string;
    company_id: number;
    created_at: string;
  };
  message: string;
};

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password || !companyName || !industry) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetchJson<SignupResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          company_name: companyName,
          industry,
        }),
      });

      setSuccess(response.message);
      
      // Store user info in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          company_id: response.user.company_id,
        })
      );

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-12 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="glass-card rounded-3xl border border-emerald/10 p-8 shadow-soft">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                  Create Account
                </h1>
                <p className="text-primary-foreground/70">
                  Join us to start tracking your carbon emissions
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-400">{success}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-emerald/50" />
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Company Name
                  </label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-emerald/50" />
                    <Input
                      type="text"
                      placeholder="Your Company Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Industry
                  </label>
                  <div className="relative mt-2">
                    <Briefcase className="absolute left-3 top-3 h-5 w-5 text-emerald/50" />
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="h-10 w-full rounded-md border border-border bg-background pl-10 text-sm text-foreground"
                      disabled={isLoading}
                    >
                      <option value="">Select an industry</option>
                      <option value="logistics">Logistics & Transportation</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail & Distribution</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="agricultural">Agricultural</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-emerald/50" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>

                {/* Login Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-emerald hover:text-emerald-400 font-medium transition"
                  >
                    Log in
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    </div>
  );
};

export default Signup;
