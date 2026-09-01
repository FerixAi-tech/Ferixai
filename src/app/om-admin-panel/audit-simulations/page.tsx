import AdminAuditSimulations from "@/components/admin/AdminAuditSimulations";
import { isAdminPanelAuthenticated } from "@/lib/auth/admin-panel";
import AdminPanelLogin from "@/components/admin/AdminPanelLogin";

export default async function OmAdminAuditSimulationsPage() {
  const authed = await isAdminPanelAuthenticated();

  if (!authed) {
    return <AdminPanelLogin />;
  }

  return <AdminAuditSimulations />;
}
