
import React from "react";
import { FileText } from "lucide-react";

export const AuditLogsTab = () => {
    return (
        <div className="space-y-8">
             <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Audit Logs</h2>
                <p className="text-sm text-muted-foreground mt-1">View system activity and changes.</p>
            </div>
            
            <div className="bg-card/50 border border-border rounded-xl shadow-sm backdrop-blur-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary border border-primary/20">
                    <FileText className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No recent activity</h3>
                <p className="text-muted-foreground max-w-sm mt-2 leading-relaxed">
                    System logs will appear here once activity is recorded. This feature is currently in read-only mode for security verification.
                </p>
                <div className="mt-8">
                    <button className="px-6 py-2 bg-muted text-muted-foreground font-medium rounded-lg hover:bg-muted/80 hover:text-foreground transition-all">
                        Refresh Logs
                    </button>
                </div>
            </div>
        </div>
    );
};
