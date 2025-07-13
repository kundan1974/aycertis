import MainLayout from "../components/MainLayout";

export default function Reports() {
  return (
    <MainLayout active="reports">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-slate-600 mt-2">View business reports and analytics here. (Feature coming soon)</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-12 flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-5xl mb-4">📊</span>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Reports Module</h2>
          <p className="text-slate-500 text-center max-w-md">Reporting and analytics features will be available soon. You will be able to view inventory, sales, and business performance reports from this page.</p>
        </div>
      </div>
    </MainLayout>
  );
} 