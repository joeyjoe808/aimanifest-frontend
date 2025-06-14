import DemoPanel from '@/components/DemoPanel';

export default function DemoPanelTest() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            DemoPanel Manifest Workflow Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Testing auto-generated backend routes and SmartButton integration
          </p>
        </div>
        
        <DemoPanel />
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Workflow Status
          </h2>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div>✅ Component scanned and manifest generated</div>
            <div>✅ Backend routes auto-created from manifest</div>
            <div>✅ SmartButton integration with error handling</div>
            <div>✅ Master AI coordination ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}