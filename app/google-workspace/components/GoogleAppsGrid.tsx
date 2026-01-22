import React from "react";
import { 
  Mail, 
  HardDrive, 
  Calendar, 
  FileText, 
  Table, 
  Presentation, 
  Video, 
  MessageSquare 
} from "lucide-react";
import Link from "next/link";

const GOOGLE_APPS = [
  { name: "Gmail", icon: Mail, url: "https://mail.google.com", color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Drive", icon: HardDrive, url: "https://drive.google.com", color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Calendar", icon: Calendar, url: "https://calendar.google.com", color: "text-green-500", bg: "bg-green-500/10" },
  { name: "Docs", icon: FileText, url: "https://docs.google.com", color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "Sheets", icon: Table, url: "https://sheets.google.com", color: "text-green-400", bg: "bg-green-400/10" },
  { name: "Slides", icon: Presentation, url: "https://slides.google.com", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { name: "Meet", icon: Video, url: "https://meet.google.com", color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "Chat", icon: MessageSquare, url: "https://chat.google.com", color: "text-green-600", bg: "bg-green-600/10" },
];

export default function GoogleAppsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {GOOGLE_APPS.map((app) => (
        <Link
          key={app.name}
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all duration-300 group"
        >
          <div className={`p-4 rounded-full ${app.bg} mb-3 group-hover:scale-110 transition-transform duration-300`}>
            <app.icon className={`w-8 h-8 ${app.color}`} />
          </div>
          <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
            {app.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
