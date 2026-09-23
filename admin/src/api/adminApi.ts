import { client } from "@/api/client";
import type { AdminUser } from "@/store/authStore";

export interface AuthResponse {
  access: string;
  refresh: string;
  user: AdminUser;
}

export interface AdminStats {
  users_total: number;
  reports_total: number;
  reports_pending: number;
  reports_approved: number;
  reports_rejected: number;
  rewards_total: number;
  withdrawals_pending: number;
  withdrawals_paid_total: number;
  paid_last_7d: number;
}

export interface AdminReport {
  id: number;
  user_phone: string;
  user_name: string;
  waste_type: string;
  waste_type_display: string;
  description: string;
  status: string;
  status_display: string;
  reward_amount: number;
  latitude: number;
  longitude: number;
  address: string;
  accuracy_m: number | null;
  image: string | null;
  client_uid: string;
  created_at: string;
}

export interface AdminWithdrawal {
  id: number;
  user_phone: string;
  user_name: string;
  amount: number;
  card_number: string;
  masked_card: string;
  status: string;
  status_display: string;
  note: string;
  created_at: string;
}

export interface AdminUserRow {
  id: number;
  phone: string;
  full_name: string;
  balance: number;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  report_stats: { total: number; approved: number };
}

export interface AdminTx {
  id: number;
  amount: number;
  type_display: string;
  status_display: string;
  reference: string;
  note: string;
  created_at: string;
}

export interface AuditEntry {
  id: number;
  admin: string;
  action: string;
  target_type: string;
  target_id: number;
  details: Record<string, unknown>;
  created_at: string;
}

export const authApi = {
  login: async (payload: { phone: string; password: string }) =>
    (await client.post<AuthResponse>(`auth/login/`, payload)).data,
  me: async () => (await client.get<{ user: AdminUser }>(`auth/me/`)).data,
};

export const adminApi = {
  stats: () => client.get<AdminStats>(`admin/stats/`).then((r) => r.data),
  reports: (params?: { status?: string; search?: string }) =>
    client.get<{ results: AdminReport[] }>(`admin/reports/`, { params }).then((r) => r.data),
  approveReport: (id: number, amount: number) =>
    client.post<AdminReport>(`admin/reports/${id}/approve/`, { amount }).then((r) => r.data),
  rejectReport: (id: number, reason = "") =>
    client.post<AdminReport>(`admin/reports/${id}/reject/`, { reason }).then((r) => r.data),
  withdrawals: (params?: { status?: string }) =>
    client.get<{ results: AdminWithdrawal[] }>(`admin/withdrawals/`, { params }).then((r) => r.data),
  withdrawalAction: (id: number, action: "approve" | "reject" | "mark-paid", note = "") =>
    client.post<AdminWithdrawal>(`admin/withdrawals/${id}/${action}/`, { note }).then((r) => r.data),
  users: (search?: string) =>
    client.get<{ results: AdminUserRow[] }>(`admin/users/`, { params: { search } }).then((r) => r.data),
  adjustBalance: (id: number, amount: number, reason: string) =>
    client.post<{ balance: number }>(`admin/users/${id}/adjust-balance/`, { amount, reason }).then((r) => r.data),
  transactions: () => client.get<{ results: AdminTx[] }>(`admin/transactions/`).then((r) => r.data),
  audit: () => client.get<{ results: AuditEntry[] }>(`admin/audit-log/`).then((r) => r.data),
};