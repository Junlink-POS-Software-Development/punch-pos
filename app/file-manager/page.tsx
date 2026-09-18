import { Metadata } from "next";
import { FileManagerView } from "./components/FileManagerView";

export const metadata: Metadata = {
  title: "File Manager | PUNCH POS",
  description: "Organize images, manage folders, and store compressed media.",
};

export default function FileManagerPage() {
  return <FileManagerView />;
}
