import { SignUp } from "@clerk/nextjs";
import { Code2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-bounce" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6 font-mono">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              MeetYourAPI
            </h1>
          </div>
          
          <h2 className="text-2xl font-mono font-bold text-white mb-2">
            Join the Community
          </h2>
          <p className="text-slate-400 font-mono">
            Create your account to get started
          </p>
        </div>

        {/* Sign Up Component */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <SignUp 
            signInUrl="/sign-in"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none",
                headerTitle: "text-white font-mono",
                headerSubtitle: "text-slate-400 font-mono",
                socialButtonsBlockButton: "bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 font-mono",
                socialButtonsBlockButtonText: "font-mono",
                dividerLine: "bg-slate-600",
                dividerText: "text-slate-400 font-mono",
                formFieldLabel: "text-slate-300 font-mono",
                formFieldInput: "bg-slate-700/50 border-slate-600/50 text-white font-mono focus:border-cyan-500/50 focus:ring-cyan-500/25",
                formButtonPrimary: "bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-cyan-500/25 font-mono font-semibold",
                footerActionLink: "text-cyan-400 hover:text-cyan-300 font-mono",
                footerActionText: "text-slate-400 font-mono",
                identityPreviewText: "text-slate-300 font-mono",
                identityPreviewEditButton: "text-cyan-400 hover:text-cyan-300 font-mono"
              },
              layout: {
                socialButtonsPlacement: "top"
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 font-mono text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}