"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold mb-4">Xatolik yuz berdi</h2>
          <p className="text-gray-500 mb-6 text-sm">
            {error.message || "Kutilmagan xatolik"}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </body>
    </html>
  );
}
