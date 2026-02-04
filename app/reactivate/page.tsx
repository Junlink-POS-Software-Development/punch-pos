export default function ReactivatePage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#0B1120] p-6 text-white">
      <div className="border-slate-800 bg-slate-900/50 p-8 border rounded-2xl w-full max-w-md text-center">
        <h1 className="mb-4 font-bold text-2xl text-red-500">Account Deactivated</h1>
        <p className="text-slate-400 mb-8">
          Your account has been deactivated. Please contact support or your administrator to reactivate your account.
        </p>
        
        {/* Placeholder for future reactivation controls */}
        <div className="bg-slate-950 p-4 rounded-lg text-sm text-slate-500">
          Reactivation options will be available here.
        </div>
      </div>
    </div>
  );
}
