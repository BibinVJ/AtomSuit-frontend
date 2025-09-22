"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../hooks/useAuth";
import Divider from "../common/Divider";
import SocialButton from "../ui/button/SocialButton";
import GoogleIcon from "../../icons/GoogleIcon";
import XIcon from "../../icons/XIcon";
import { toast } from "sonner";
import { isApiError } from "../../utils/errors";
import { Eye, EyeClosed } from "lucide-react";

export default function SignInForm() {
  const [form, setForm] = useState({ identifier: "", password: "" }); // email or mobile
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const isEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.identifier) {
      setErrors({ ...errors, identifier: "Email or mobile is required" });
      return;
    }

    // validate only if it looks like an email
    if (form.identifier.includes("@") && !isEmail(form.identifier)) {
      setErrors({ ...errors, identifier: "Invalid email address" });
      return;
    }

    if (!form.password) {
      setErrors({ ...errors, password: "Password is required" });
      return;
    }

    setLoading(true);

    try {
      // your backend should accept `identifier` (either email or phone)
      await login(form.identifier, form.password, stayLoggedIn);
      router.push("/");
    } catch (err: unknown) {
      if (isApiError(err)) {
        const message = err.response?.data?.message || "An error occurred";
        setErrors({
          identifier: err.response?.data?.errors?.identifier?.[0] || " ",
          password: err.response?.data?.errors?.password?.[0] || " ",
        });
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
            <SocialButton icon={<GoogleIcon />} label="Sign in with Google" />
            <SocialButton icon={<XIcon />} label="Sign in with X" />
          </div>

          <Divider text="Or" />

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email or Mobile <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="Enter email or mobile"
                  autoComplete="username"
                  error={!!errors.identifier}
                  hint={errors.identifier}
                />
              </div>
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  hint={errors.password}
                  rightIcon={
                    showPassword ? (
                      <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                        <EyeClosed className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )
                  }
                  onRightIconClick={() => setShowPassword(!showPassword)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={stayLoggedIn} onChange={setStayLoggedIn} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
                <Link
                  href="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>

              <Button className="w-full" size="sm" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
