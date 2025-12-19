"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Pill,
  FlaskConical,
  ShoppingCart,
  Users,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { getSocket } from "@/lib/socket";

/* ================= Types ================= */

type Notification = {
  id: number;
  message: string;
  link: string;
};

type SearchResult = {
  type: "medicine" | "order" | "customer";
  id: number;
  title: string;
};

/* ================= Layout ================= */

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  /* ================= Load notifications (DB) ================= */
  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, []);

  /* ================= Socket (REAL-TIME) ================= */
  useEffect(() => {
    const socket = getSocket();

    socket.on("admin:notification", (data: Notification) => {
      setNotifications((prev) => {
        // duplicate protection
        if (prev.some((n) => n.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    return () => {
      socket.off("admin:notification");
    };
  }, []);

  /* ================= Live Search ================= */
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${search}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  /* ================= Outside Click ================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setOpenProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpenNotifications(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-slate-100 overflow-hidden">
      {/* ================= Sidebar ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64
        bg-gradient-to-b from-emerald-900 to-emerald-700 text-white
        transform transition-transform duration-300
        ${openSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:static`}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-bold">Pharmacy Admin</span>
          <button onClick={() => setOpenSidebar(false)}>
            <X />
          </button>
        </div>

        <div className="p-5 border-b border-emerald-800 hidden md:block">
          <h2 className="text-xl font-bold">Pharmacy Admin</h2>
          <p className="text-xs text-emerald-200 mt-1">Management Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 text-sm">
          <SidebarLink href="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarLink href="/admin/medicines" icon={<Pill size={18} />} label="Medicines" />
          <SidebarLink href="/admin/lab-tests" icon={<FlaskConical size={18} />} label="Lab Tests" />
          <SidebarLink href="/admin/orders" icon={<ShoppingCart size={18} />} label="Orders" />
          <SidebarLink href="/admin/customers" icon={<Users size={18} />} label="Customers" />
        </nav>

        <div className="p-4 text-xs text-emerald-200">
          © {new Date().getFullYear()} Pharmacy
        </div>
      </aside>

      {/* ================= Main ================= */}
      <div className="flex-1 flex flex-col">
        {/* ================= Header ================= */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 relative">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setOpenSidebar(true)}>
              <Menu />
            </button>

            <span className="font-semibold text-gray-800 hidden sm:block">
              Admin Dashboard
            </span>

            {/* Search */}
            <div className="relative hidden sm:block">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicine, order, customer..."
                className="border rounded-lg px-3 py-1.5 text-sm w-56
                focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              {search && (
                <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow z-50">
                  {results.length === 0 && (
                    <div className="p-3 text-sm text-gray-400">
                      No results found
                    </div>
                  )}

                  {results.map((r) => (
                    <Link
                      key={`${r.type}-${r.id}`}
                      href={
                        r.type === "medicine"
                          ? `/admin/medicines/${r.id}`
                          : r.type === "order"
                          ? `/admin/orders/${r.id}`
                          : `/admin/customers/${r.id}`
                      }
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => {
                        setSearch("");
                        setResults([]);
                      }}
                    >
                      <span className="text-xs text-gray-400 mr-2">
                        {r.type.toUpperCase()}
                      </span>
                      {r.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setOpenNotifications(!openNotifications);
                  setOpenProfile(false);
                }}
                className="relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px]
                  h-4 w-4 rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {openNotifications && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow border z-50">
                  <div className="px-4 py-2 text-sm font-semibold border-b">
                    Live Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400 text-center">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {n.message}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setOpenProfile(!openProfile);
                  setOpenNotifications(false);
                }}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white
                flex items-center justify-center font-bold">
                  A
                </div>
                <ChevronDown size={16} />
              </button>

              {openProfile && (
                <div className="absolute right-0 mt-3 w-44 bg-white rounded-lg shadow border z-50 text-sm">
                  <DropdownLink href="/admin/profile" icon={<User size={16} />} label="Profile" />
                  <DropdownLink href="/admin/settings" icon={<Settings size={16} />} label="Settings" />
                  <hr />
                  <DropdownLink href="/admin/logout" icon={<LogOut size={16} />} label="Logout" danger />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= Content ================= */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

/* ================= Helpers ================= */

function SidebarLink({ href, icon, label }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-800"
    >
      {icon}
      {label}
    </Link>
  );
}

function DropdownLink({ href, icon, label, danger }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 ${
        danger ? "text-red-600" : ""
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
