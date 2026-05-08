export const APP_NAME = "Website Review Hub";
export const APP_DESCRIPTION = "Profitia - Website Review & Feedback Platform";

export const PILLARS = [
  { slug: "doradztwo", name: "Doradztwo" },
  { slug: "edukacja", name: "Edukacja" },
  { slug: "career", name: "Career" },
] as const;

export const DEFAULT_SECTIONS = [
  { slug: "hero", name: "Hero" },
  { slug: "value-proposition", name: "Value Proposition" },
  { slug: "offer", name: "Offer" },
  { slug: "cta", name: "CTA" },
  { slug: "footer", name: "Footer" },
] as const;

export const SCORE_MIN = 1;
export const SCORE_MAX = 5;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Pillars", href: "/dashboard/pillars", icon: "Layers" },
  { label: "Reviews", href: "/dashboard/reviews", icon: "ClipboardList" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart2" },
] as const;
