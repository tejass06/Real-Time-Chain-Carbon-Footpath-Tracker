import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroBg from "@/assets/hero-bg.jpg";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-4 pt-20">
          <div className="mx-auto w-full max-w-md rounded-2xl glass-card p-8 md:p-10 shadow-soft">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Use any email and password to sign in to the demo.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@carbontrack.com"
                  defaultValue="demo@carbontrack.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Any password"
                  defaultValue="demo1234"
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full">
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-xs text-muted-foreground text-center">
              Demo credentials: demo@carbontrack.com / demo1234
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    </div>
  );
};

export default Login;
