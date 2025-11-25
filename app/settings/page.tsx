import VoucherSettings from "./components/VoucherSettings";

export default function SettingsPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="space-y-8">
        <section>
          <VoucherSettings />
        </section>
      </div>
    </div>
  );
}
