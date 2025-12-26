export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md px-6 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">RAFFLE PILOT</h1>

        <div className="text-sm text-gray-400 space-y-1">
          <div>Network: Polygon</div>
          <div>Status: OPEN</div>
          <div>Tickets sold: 0 / 10000</div>
        </div>

       <button className="mx-auto block px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition">
  CONNECT WALLET
</button>

      </div>
    </main>
  );
}
