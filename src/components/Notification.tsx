import { useUIStore } from "../store/uiStore";
import { CheckCircle, XCircle, Info } from "lucide-react";

export function Notification() {
    const { notification } = useUIStore();
    if (!notification) return null;

    const icons = { success: CheckCircle, error: XCircle, info: Info };
    const colors = { success: "text-green-400 border-green-500/30 bg-green-500/10", error: "text-red-400 border-red-500/30 bg-red-500/10", info: "text-blue-400 border-blue-500/30 bg-blue-500/10" };
    const Icon = icons[notification.type];

    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium animate-slide-in ${colors[notification.type]}`}>
            <Icon size={16} />
            {notification.message}
        </div>
    );
}