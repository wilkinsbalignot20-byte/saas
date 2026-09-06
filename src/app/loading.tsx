 // src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Modern CSS Spinner */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium animate-pulse">
          Loading store... Please wait
        </p>
      </div>
    </div>
  );
}
