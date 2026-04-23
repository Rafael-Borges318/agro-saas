export function Clima() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🌦️ Clima</h1>
        <p className="text-gray-500 text-sm mt-0.5">Previsão meteorológica para a sua região</p>
      </div>
      <div className="card flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-6xl">🌦️</span>
        <div>
          <p className="font-semibold text-gray-700">Clima</p>
          <p className="text-sm text-gray-400 mt-1">Módulo em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}
