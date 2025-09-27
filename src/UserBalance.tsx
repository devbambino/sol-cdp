import { LoadingSkeleton } from "@coinbase/cdp-react/components/ui/LoadingSkeleton";

import { CDP_CONFIG } from "./config";

interface Props {
  balance?: string;
}

/**
 * A component that displays the user's balance.
 *
 * @param {Props} props - The props for the UserBalance component.
 * @param {string} [props.balance] - The user's balance.
 * @returns A component that displays the user's balance.
 */
function UserBalance(props: Props) {
  const { balance } = props;
  const isSolana = !!CDP_CONFIG.solana;

  return (
    <>
      <h2 className="card-title">Available balance</h2>
      <p className="user-balance flex-col-container flex-grow">
        {balance === undefined && <LoadingSkeleton as="span" className="loading--balance" />}
        {balance !== undefined && (
          <span className="flex-row-container">
            <img src={isSolana ? "/sol.svg" : "/eth.svg"} alt="" className="balance-icon" />
            <span>{balance}</span>
            <span className="sr-only">{isSolana ? "Solana" : "Ethereum"}</span>
          </span>
        )}
      </p>
      <p>
        {isSolana ? (
          <>
            Get testnet SOL from{" "}
            <a
              href="https://portal.cdp.coinbase.com/products/faucet?network=solana-devnet"
              target="_blank"
              rel="noopener noreferrer"
            >
              Solana Devnet Faucet
            </a>
          </>
        ) : (
          <>
            Get testnet ETH from{" "}
            <a
              href="https://portal.cdp.coinbase.com/products/faucet"
              target="_blank"
              rel="noopener noreferrer"
            >
              Base Sepolia Faucet
            </a>
          </>
        )}
      </p>
    </>
  );
}

export default UserBalance;
