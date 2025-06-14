// components/LoadingScreen.tsx
export const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-white">
      <div className="text-center space-y-4">
        <div className="text-2xl font-light">Your AI team is getting to work...</div>
        <div className="text-sm text-gray-400">Assigning agents, planning architecture, launching the build.</div>
        <div className="mt-6">
          <div className="w-24 h-1 bg-blue-600 animate-pulse rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
};