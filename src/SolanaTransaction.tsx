import { Buffer } from "buffer";

import { useSolanaAddress } from "@coinbase/cdp-hooks";
import {
  SendSolanaTransactionButton,
  type SendSolanaTransactionButtonProps,
} from "@coinbase/cdp-react/components/SendSolanaTransactionButton";
import { Button } from "@coinbase/cdp-react/components/ui/Button";
import { LoadingSkeleton } from "@coinbase/cdp-react/components/ui/LoadingSkeleton";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
} from "@solana/web3.js";
import { useMemo, useState } from "react";

interface Props {
  balance?: string;
  onSuccess?: () => void;
}

/**
 * This component demonstrates how to send a Solana transaction.
 *
 * @param {Props} props - The props for the SolanaTransaction component.
 * @param {string} [props.balance] - The user's balance.
 * @param {() => void} [props.onSuccess] - A function to call when the transaction is successful.
 * @returns A component that displays a transaction form and a transaction signature.
 */
function SolanaTransaction(props: Props) {
  const { balance, onSuccess } = props;
  const { solanaAddress } = useSolanaAddress();
  const [transactionSignature, setTransactionSignature] = useState("");
  const [error, setError] = useState("");

  const hasBalance = useMemo(() => {
    return balance && balance !== "0";
  }, [balance]);

  const transaction = useMemo(() => {
    if (!solanaAddress) return "";
    return createAndEncodeTransaction(solanaAddress);
  }, [solanaAddress]);

  const handleTransactionError: SendSolanaTransactionButtonProps["onError"] = error => {
    setTransactionSignature("");
    setError(error.message);
  };

  const handleTransactionSuccess: SendSolanaTransactionButtonProps["onSuccess"] = signature => {
    setTransactionSignature(signature);
    setError("");
    onSuccess?.();
  };

  const handleReset = () => {
    setTransactionSignature("");
    setError("");
  };

  return (
    <>
      {balance === undefined && (
        <>
          <h2 className="card-title">Send a Solana transaction</h2>
          <LoadingSkeleton className="loading--text" />
          <LoadingSkeleton className="loading--btn" />
        </>
      )}
      {balance !== undefined && (
        <>
          {!transactionSignature && error && (
            <>
              <h2 className="card-title">Oops</h2>
              <p>{error}</p>
              <Button className="tx-button" onClick={handleReset} variant="secondary">
                Reset and try again
              </Button>
            </>
          )}
          {!transactionSignature && !error && (
            <>
              <h2 className="card-title">Send a Solana transaction</h2>
              {hasBalance && solanaAddress && (
                <>
                  <p>Send 1 Lamport to yourself on Solana Devnet</p>
                  <SendSolanaTransactionButton
                    account={solanaAddress}
                    network="solana-devnet"
                    transaction={transaction}
                    onError={handleTransactionError}
                    onSuccess={handleTransactionSuccess}
                  />
                </>
              )}
              {!hasBalance && (
                <>
                  <p>
                    This example transaction sends a tiny amount of SOL from your wallet to itself.
                  </p>
                  <p>
                    Get some from{" "}
                    <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">
                      Solana Devnet Faucet
                    </a>
                  </p>
                </>
              )}
            </>
          )}
          {transactionSignature && (
            <>
              <h2 className="card-title">Transaction sent</h2>
              <p>
                Transaction signature:{" "}
                <a
                  href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {transactionSignature.slice(0, 6)}...{transactionSignature.slice(-4)}
                </a>
              </p>
              <Button variant="secondary" className="tx-button" onClick={handleReset}>
                Send another transaction
              </Button>
            </>
          )}
        </>
      )}
    </>
  );
}

/**
 * Creates and encodes a Solana transaction.
 *
 * @param address - The address of the sender.
 * @returns The base64 encoded transaction.
 */
function createAndEncodeTransaction(address: string) {
  const recipientAddress = new PublicKey(address);

  const fromPubkey = new PublicKey(address);

  const transferAmount = 1; // 1 Lamport

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: recipientAddress,
      lamports: transferAmount,
    }),
  );

  transaction.recentBlockhash = SYSVAR_RECENT_BLOCKHASHES_PUBKEY.toBase58();
  transaction.feePayer = fromPubkey;

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  });

  return Buffer.from(serializedTransaction).toString("base64");
}

export default SolanaTransaction;
