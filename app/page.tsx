import Link from "next/link";
import { auth } from "@/auth";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  FileText,
  Bot,
  Zap,
  CheckCircle2,
  TrendingUp,
  Cable,
  Target,
  Clock,
  Layers,
  Search,
  Building2,
  MapPin,
  ChevronRight,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                JobBuddy <span className="text-primary text-xs font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Autonomous Job Agent</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#connectors" className="hover:text-foreground transition-colors">ATS Connectors</a>
            <a href="#preview" className="hover:text-foreground transition-colors">Live Preview</a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden lg:inline-block text-xs text-muted-foreground">
                  Signed in as <strong className="text-foreground">{session.user.name || session.user.email}</strong>
                </span>
                <Link href="/dashboard">
                  <Button size="sm" className="gap-1.5 shadow-sm font-semibold text-xs sm:text-sm">
                    <span>Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <LogoutButton variant="outline" className="text-xs h-9 px-3" />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="gap-1.5 font-semibold shadow-sm shadow-primary/20">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Autonomous Job Search &amp; Application Copilot</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Land Your Dream Job 10x Faster with{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Autonomous AI
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Upload your resume once. Our AI parses your career profile, continuously syncs live jobs directly from applicant tracking systems (Greenhouse, Lever, Ashby), calculates semantic match scores, and prepares tailored applications in one click.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {session?.user ? (
                <>
                  <Link href="/dashboard/resume" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold px-8 py-6 rounded-2xl shadow-lg shadow-primary/25">
                      <FileText className="h-5 w-5" />
                      <span>Upload &amp; Parse Resume</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/jobs" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-base font-medium px-8 py-6 rounded-2xl">
                      <Search className="h-5 w-5" />
                      <span>Browse Discovered Jobs</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold px-8 py-6 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
                      <Zap className="h-5 w-5" />
                      <span>Get Started Free — Upload Resume</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/sign-in" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-base font-medium px-8 py-6 rounded-2xl">
                      <span>Sign In to Existing Account</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Value Indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Zero spam aggregators</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Direct ATS API Connectors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Gemini AI Profile Parsing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>100% Free to Get Started</span>
              </div>
            </div>
          </div>
        </section>

        {/* ATS Connectors Live Sync Strip */}
        <section id="connectors" className="border-y border-border/50 bg-muted/30 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-6">
              Real-time Ingestion Directly from Verified Applicant Tracking Systems
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-80 hover:opacity-100 transition-opacity">
              {[
                { name: "Greenhouse", icon: "🌱", status: "Active" },
                { name: "Lever", icon: "⚡", status: "Active" },
                { name: "Ashby", icon: "🚀", status: "Active" },
                { name: "Workday", icon: "🏢", status: "Connected" },
                { name: "SmartRecruiters", icon: "🎯", status: "Connected" },
                { name: "LinkedIn Jobs", icon: "💼", status: "Synced" },
              ].map((ats) => (
                <div
                  key={ats.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/60 shadow-xs text-xs font-medium text-foreground"
                >
                  <span className="text-base">{ats.icon}</span>
                  <span>{ats.name}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Simple 3-Step Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How JobBuddy AI Automates Your Search
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-3">
              Spend less time filling repetitive forms and more time preparing for actual interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <Badge variant="secondary">Step 1</Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Upload Resume</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drop your PDF or Word resume. Gemini AI instantly extracts your skills, work experiences, education, and social portfolios.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-border/40 flex items-center gap-2 text-xs text-primary font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Auto-populates full career profile</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <Badge variant="secondary">Step 2</Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Match &amp; Discover</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our system continuously cross-references active ATS job openings with your profile and computes a 0-100% semantic fit match score.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-border/40 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                <Target className="h-4 w-4" />
                <span>Real-time match scoring engine</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <Badge variant="secondary">Step 3</Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Apply &amp; Track</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate tailored cover letters, submit applications, and monitor progress across stages in an intuitive visual Kanban board.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-border/40 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Organized application pipeline</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="py-20 bg-muted/20 border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Key Capabilities</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Engineered for High-Velocity Job Seekers
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-3">
                Everything you need to bypass job board fatigue and land interviews at top companies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">Gemini AI Resume Extraction</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Extracts structured skills, employment chronologies, quantifiable achievements, and certifications from PDF and DOCX files automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Cable className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">Direct ATS Connector Hub</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ingests authentic job listings directly from corporate applicant tracking systems (Greenhouse, Lever, Ashby) to eliminate phantom listings.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Target className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">Smart Match Ranking</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ranks opportunities by true keyword and semantic relevance, highlighting skill overlaps and gaps so you apply where you stand out.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">Tailored Application Assets</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate targeted cover letters and resume bullet adaptations aligned with specific job requirements and company missions.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">Kanban Application Tracker</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track every submission from Discovered, Applied, Technical Screen, Onsite Interview, through Offer with deadline reminders.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">Privacy &amp; Data Ownership</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your resumes and credentials remain strictly confidential, encrypted, and isolated in your private workspace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Job Card Showcase Section */}
        <section id="preview" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-card via-card to-muted/50 border border-border/80 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4 text-left">
                <Badge variant="outline" className="border-primary/30 text-primary">Live Match Intelligence</Badge>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  See how JobBuddy AI scores every opportunity
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every discovered job is analyzed in real time. You get instant visibility into match percentage, source ATS system, required skills, and direct apply links.
                </p>
                <div className="pt-2">
                  <Link href={session?.user ? "/dashboard/jobs" : "/sign-up"}>
                    <Button size="sm" className="gap-2">
                      <span>Explore Discovered Jobs</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sample Interactive Job Card */}
              <div className="lg:col-span-7">
                <div className="p-6 rounded-2xl bg-card/90 border border-border/70 shadow-lg space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-foreground">Senior Full Stack Engineer</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>Stripe</span> &bull; 
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> San Francisco, CA (Hybrid)</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                        <Sparkles className="h-3 w-3" /> 94% Match
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "TailwindCSS"].map((sk) => (
                      <Badge key={sk} variant="secondary" className="text-[11px] font-normal">
                        {sk}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px]">
                        🌱 Greenhouse ATS
                      </span>
                      <span>Discovered 2 hours ago</span>
                    </div>
                    <Button size="xs" variant="default" className="text-xs">
                      1-Click Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Call To Action Banner */}
        <section className="py-16 md:py-24 border-t border-border/40 bg-gradient-to-b from-background via-muted/20 to-background text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
              Join job seekers using AI to automate discovery, customize applications, and land interviews faster.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {session?.user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 px-8 py-6 rounded-2xl font-semibold shadow-lg shadow-primary/25">
                    <span>Enter Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button size="lg" className="gap-2 px-8 py-6 rounded-2xl font-semibold shadow-lg shadow-primary/25">
                      <span>Create Free Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="outline" size="lg" className="px-8 py-6 rounded-2xl font-medium">
                      <span>Sign In</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-card/40 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">JobBuddy AI</span>
            <span>&bull; Autonomous Job Application Copilot</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link>
            <Link href="/dashboard/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
            <Link href="/dashboard/connectors" className="hover:text-foreground transition-colors">Connectors</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
