"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, User, Mail, Lock, ClipboardList } from "lucide-react";
import Link from "next/link";
import { createUser, verifyUser, isUsernameTaken } from "@/lib/db";
import RandomLoadingComponent from "@/components/ui/Loading";

export default function Auth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    if (mode === "signup") setIsLogin(false);
    else setIsLogin(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!isLogin) {
      try {
        // Create a new user object
        const newUser = {
          email: email,
          name: name,
          username: username,
          password: password,
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "",
          followers: 0,
          following: 0,
          summariesCount: 0,
          totalLikes: 0,
          totalViews: 0,
          rate: 0,
          status: "new",
          likedSummaries: [],
          savedSummaries: [],
          likedRepositories: [],
          savedRepositories: [],
        };

        const createdUser = await fetch("/api/users/register", {
          method: "post",
          body: JSON.stringify(newUser),
        });
        console.log("createdUser", createdUser)
        if (createdUser.ok) {
          const result = await createdUser.json();
          const userId = result.userId; // Access the userId from the response
          console.log("User ID:", userId);
          router.push(`/dashboard?userId=${userId}`);
        } else {
          setError("An error occurred. Please try again.");
          console.error("Auth error:", error);
        }
      } catch (error) {
        setError("An error occurred. Please try again.");
        console.error("Auth error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
      const response = await fetch("/api/users/login", {
        method: "post",
        body: JSON.stringify({ username: username, password: password }),
      });
      const result = await response.json()
      console.log("result: ", result);
      console.log("result.success: ", result.success);
      if (result.success) {
        setIsLoading(true);
        router.push(`/dashboard?userId=${result.userId}`);
      } else {
        setError(result.message || "Invalid username or password");
        console.log("error")
      }

    } catch (error) {
      setError("Cant find this user");
    }
  }
  }

  if (isLoading) {
    return <RandomLoadingComponent />;
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col justify-center items-center p-4">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <ClipboardList className="h-8 w-8 text-orange-500" />
        <span className="text-2xl font-bold text-orange-700">LeSikum</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Log In" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Welcome back! Please log in to your account."
              : "Create a new account to start sharing summaries."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error != null && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                  <Input
                    id="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                <Input
                  id="username"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLogin ? "Log In" : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="outline"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full"
          >
            {isLogin
              ? "Need an account? Sign Up"
              : "Already have an account? Log In"}
          </Button>
          {isLogin && (
            <Link
              href="/forgot-password"
              className="text-sm text-orange-600 hover:underline"
            >
              Forgot your password?
            </Link>
          )}
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-orange-600">
        By {isLogin ? "logging in" : "signing up"}, you agree to LeSikum's{" "}
        <Link
          href="/terms"
          className="font-medium text-orange-600 hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="font-medium text-orange-600 hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
