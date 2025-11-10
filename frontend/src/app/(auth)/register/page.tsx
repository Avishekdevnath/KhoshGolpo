import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-5xl lg:flex lg:items-center lg:gap-12">
      <div className="hidden lg:block lg:flex-1">
        <h2 className="text-3xl font-semibold text-white">Create your workspace</h2>
        <p className="mt-3 text-sm text-slate-400 max-w-md">
          Choose a handle, set your profile, and invite teammates to start warm conversations.
        </p>
      </div>

      <div className="w-full lg:w-96">
        <Card className="w-full border border-slate-800/60 bg-slate-950/85 px-6 py-8">
          <CardHeader className="px-0 mb-2">
            <CardTitle className="text-lg font-semibold text-white">Create account</CardTitle>
          </CardHeader>

          <CardContent className="px-0">
            <RegisterForm />
          </CardContent>

          <CardFooter className="px-0">
            <p className="w-full text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-white">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

