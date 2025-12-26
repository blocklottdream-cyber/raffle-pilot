"use client";

import { useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";

const POLYGON_CHAIN_ID_DEC = 137;
const POLYGON_CHAIN_ID_HEX = "0x89";

function shortAddr(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const hasMM = useMemo(() => typeof window !== "undefined" && !!(window as any).ethereum, []);

  async function refresh() {
    setError("");
    const eth = (window as any).ethereum;
    if (!eth) return;

    try {
      const provider = new BrowserProvider(eth);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));

      const accounts: string[] = await eth.request({ method: "eth_accounts" });
      setAddress(accounts?.[0] ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Failed to read wallet");
    }
  }

  async function connect() {
    setError("");
    const eth = (window as any).ethereum;
    if (!eth) {
      setError("MetaMask not found. Install MetaMask extension.");
      return;
    }

    try {
      const provider = new BrowserProvider(eth);
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      setAddress(accounts?.[0] ?? "");

      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (e: any) {
      setError(e?.message ?? "Connection cancelled");
    }
  }

  async function switchToPolygon() {
    setError("");
    const eth = (window as any).ethereum;
    if (!eth) return;

    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_CHAIN_ID_HEX }],
      });
      await refresh();
    } catch (e: any) {
      // Если Polygon не добавлен, добавим (редко, но бывает)
      if (e?.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: POLYGON_CHAIN_ID_HEX,
                chainName: "Polygon Mainnet",
                nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
                rpcUrls: ["https://polygon-rpc.com/"],
                blockExplorerUrls: ["https://polygonscan.com/"],
              },
            ],
          });
          await refresh();
        } catch (e2: any) {
          setError(e2?.message ?? "Failed to add Polygon");
        }
      } else {
        setError(e?.message ?? "Failed to switch network");
      }
    }
  }

  useEffect(() => {
    refresh();

    const eth = (window as any).ethereum;
    if (!eth) return;

    const onAccounts = (accs: string[]) => setAddress(accs?.[0] ?? "");
    const onChain = () => refresh();

    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);

    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPolygon = chainId === POLYGON_CHAIN_ID_DEC;

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md px-6 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">RAFFLE PILOT</h1>

        <div className="text-sm text-gray-400 space-y-1">
          <div>Network: {chainId === null ? "…" : isPolygon ? "Polygon" : `Chain ${chainId}`}</div>
          <div>Status: OPEN</div>
          <div>Tickets sold: 0 / 10000</div>
        </div>

        {!hasMM ? (
          <div className="text-sm text-gray-300">
            MetaMask not found. Install the extension and refresh.
          </div>
        ) : address ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-300">
              Connected: <span className="text-white font-semibold">{shortAddr(address)}</span>
            </div>

            {!isPolygon && (
              <button
                onClick={switchToPolygon}
                className="mx-auto block px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                SWITCH TO POLYGON
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={connect}
            className="mx-auto block px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            CONNECT WALLET
          </button>
        )}

        {error && <div className="text-xs text-red-400 break-words">{error}</div>}
      </div>
    </main>
  );
}

