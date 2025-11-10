import { LoginForm } from "@/components/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-5xl lg:flex lg:items-center lg:gap-12">
      <div className="hidden lg:block lg:flex-1">
        <h2 className="text-3xl font-semibold text-white">Welcome back to KhoshGolpo</h2>
        <p className="mt-3 text-sm text-slate-400 max-w-md">
          Sign in to access your workspace, respond to mentions, and keep conversations moving forward.
        </p>
      </div>

      <div className="w-full lg:w-96">
        <Card className="w-full border border-slate-800/60 bg-slate-950/85 px-6 py-8">
          <CardHeader className="px-0 mb-2">
            <CardTitle className="text-lg font-semibold text-white">Sign in</CardTitle>
          </CardHeader>

          <CardContent className="px-0">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

