import { useEvmAddress, useSolanaAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from "react";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";

import { CDP_CONFIG } from "./config";
import Header from "./Header";
import Loading from "./Loading";
import UserBalance from "./UserBalance";

const isSolana = !!CDP_CONFIG.solana;
const isSmartAccount = CDP_CONFIG.ethereum?.createOnLogin === "smart";

const TransactionComponent = lazy(() => import("./SolanaTransaction"));

/**
 * Create a viem client to access user's balance on the Base Sepolia network
 */
const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

/**
 * Create a Solana connection to access user's balance on Solana Devnet
 */
const solanaConnection = new Connection(clusterApiUrl("devnet"));

/**
 * The Signed In screen
 */
function SignedInScreen() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { solanaAddress } = useSolanaAddress();
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  const address = isSolana ? solanaAddress : evmAddress;

  const formattedBalance = useMemo(() => {
    if (balance === undefined) return undefined;
    if (isSolana) {
      // Convert lamports to SOL
      return formatSol(Number(balance));
    } else {
      // Convert wei to ETH
      return formatEther(balance);
    }
  }, [balance]);

  const getBalance = useCallback(async () => {
    if (isSolana && solanaAddress) {
      // Get Solana balance in lamports
      const lamports = await solanaConnection.getBalance(new PublicKey(solanaAddress));
      setBalance(BigInt(lamports));
    } else if (!isSolana && evmAddress) {
      // Get EVM balance in wei
      const weiBalance = await client.getBalance({
        address: evmAddress,
      });
      setBalance(weiBalance);
    }
  }, [evmAddress, solanaAddress]);

  useEffect(() => {
    getBalance();
    const interval = setInterval(getBalance, 500);
    return () => clearInterval(interval);
  }, [getBalance]);

  return (
    <>
      <Header />
      <main className="main flex-col-container flex-grow">
        <div className="main-inner flex-col-container">
          <div className="card card--user-balance">
            <UserBalance balance={formattedBalance} />
          </div>
          <div className="card card--transaction">
            {isSignedIn && address && (
              <Suspense fallback={<Loading />}>
                <TransactionComponent balance={formattedBalance} onSuccess={getBalance} />
              </Suspense>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

/**
 * Format a Solana balance.
 *
 * @param lamports - The balance in lamports.
 * @returns The formatted balance.
 */
function formatSol(lamports: number) {
  const maxDecimalPlaces = 9;
  const roundedStr = (lamports / LAMPORTS_PER_SOL).toFixed(maxDecimalPlaces);
  return roundedStr.replace(/0+$/, "").replace(/\.$/, "");
}

export default SignedInScreen;
