export default function SplashScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="animate-pulse rounded-lg bg-gray-200 p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Loading...</h1>
        <p className="mt-2 text-gray-500">
          Please wait while we set things up.
        </p>
      </div>
    </div>
  );
}
