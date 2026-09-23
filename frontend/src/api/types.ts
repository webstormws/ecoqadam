export type Result<T> = { success: true; data: T } | { success: false; error: string };

export interface User {
  id: number;
  phone: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string | null;
  telegram_id: number | null;
  telegram_username: string;
  balance: number;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface Profile {
  user: User;
  notifications_enabled: boolean;
  language: string;
  registered_at: string;
}

export type ReportStatus = "PENDING" | "APPROVED" | "REJECTED";
export type WithdrawStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED";

export interface Report {
  id: number;
  status: ReportStatus;
  status_display: string;
  waste_type: string;
  waste_type_display: string;
  description: string;
  reward_amount: number;
  reward_label: string | null;
  image: string | null;
  images: string[];
  latitude: number;
  longitude: number;
  address: string;
  accuracy_m: number | null;
  client_uid: string;
  created_at: string;
}

export interface ReportMin {
  id: number;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  reward_amount: number;
  created_at: string;
}

export interface ReportsSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  earned: number;
}

export interface Transaction {
  id: number;
  amount: number;
  type: string;
  type_display: string;
  status: string;
  status_display: string;
  reference: string;
  note: string;
  created_at: string;
}

export interface Withdrawal {
  id: number;
  amount: number;
  masked_card: string;
  status: WithdrawStatus;
  status_display: string;
  note: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  type_display: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface BalanceInfo {
  balance: number;
  earned_total: number;
  pending_withdrawal: number;
}

export interface MapReport {
  id: number;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  reward_amount: number;
  created_at: string;
}

export const fmt = (n: number) => `${n.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;