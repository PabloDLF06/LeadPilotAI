export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">{children}</main>;
}
