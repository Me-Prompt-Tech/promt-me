"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginLabels = {
  email: string;
  password: string;
  login: string;
  invalid_credentials: string;
};

export default function LoginForm({ labels }: { labels: LoginLabels }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(labels.invalid_credentials);
    } else {
      const isSystemAdmin = email === "admin@example.com";
      router.push(isSystemAdmin ? "/th/admin/dashboard" : "/th/dashboard");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">{labels.email}</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded text-black" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{labels.password}</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded text-black" 
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        {labels.login}
      </button>
    </form>
  );
}
