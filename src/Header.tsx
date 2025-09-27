import { useEvmAddress, useSolanaAddress } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { useCallback, useEffect, useState } from "react";

import { CDP_CONFIG } from "./config";
import { IconCheck, IconCopy, IconUser } from "./Icons";

/**
 * Header component
 */
function Header() {
  const { evmAddress } = useEvmAddress();
  const { solanaAddress } = useSolanaAddress();
  const isSolana = !!CDP_CONFIG.solana;
  const address = isSolana ? solanaAddress : evmAddress;
  const [isCopied, setIsCopied] = useState(false);

  const formatAddress = useCallback(
    (address: string) => {
      if (!address) return "";
      return isSolana
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : `${address.slice(0, 6)}...${address.slice(-4)}`;
    },
    [isSolana],
  );

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  const isSmartAccountsEnabled = import.meta.env.VITE_CDP_CREATE_ETHEREUM_ACCOUNT_TYPE === "smart";

  return (
    <header>
      <div className="header-inner">
        <div className="title-container">
          <h1 className="site-title">CDP React StarterKit</h1>
          {isSmartAccountsEnabled && <span className="smart-badge">SMART</span>}
        </div>
        <div className="user-info flex-row-container">
          {address && (
            <button
              aria-label="copy wallet address"
              className="flex-row-container copy-address-button"
              onClick={copyAddress}
            >
              {!isCopied && (
                <>
                  <IconUser className="user-icon user-icon--user" />
                  <IconCopy className="user-icon user-icon--copy" />
                </>
              )}
              {isCopied && <IconCheck className="user-icon user-icon--check" />}
              <span className="wallet-address">{formatAddress(address)}</span>
            </button>
          )}
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

export default Header;
