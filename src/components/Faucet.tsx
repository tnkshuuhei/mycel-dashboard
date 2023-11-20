import { useState, useEffect } from "react";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, DeliverTxResponse } from "@cosmjs/stargate";
import { OfflineDirectSigner } from "@keplr-wallet/types";
import { useClient } from "../hooks/useClient";
import { useWallet } from "@/hooks/useWallet";
import TxModal from "../components/TxModal";
import Button from "../components/Button";
import { HandMetal } from "lucide-react";

interface faucetProps {
  className?: string;
}
export default function Faucet(props: faucetProps) {
  const client = useClient();
  const { mycelAccount } = useWallet();

  const { className } = props;
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isClaimable, setIsClaimable] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txResponse, setTxResponse] = useState<DeliverTxResponse>();

  const faucetMnemonic = import.meta.env.VITE_FAUCET_MNEMONIC ?? "";
  const faucetThreshold = import.meta.env.VITE_FAUCET_CLAIMABLE_THRESHOLD ?? "500000";

  const queryBalance = async () => {
    if (!mycelAccount?.address) {
      return;
    }
    const balance = await client.CosmosBankV1Beta1.query
      .queryBalance(mycelAccount?.address, { denom: "umycel" })
      .then((res) => {
        if (res.data.balance?.amount) {
          return res.data.balance.amount;
        }
      });
    setBalance(balance ?? "0");
  };

  useEffect(() => {
    queryBalance();
  }, [mycelAccount]);

  useEffect(() => {
    if (parseInt(balance) < faucetThreshold) {
      setIsClaimable(true);
    } else {
      setIsClaimable(false);
    }
  }, [balance]);

  const claimFaucet = async () => {
    setIsLoading(true);
    setIsShow(true);

    if (isClaimable && mycelAccount?.address) {
      const faucetSigner = (await DirectSecp256k1HdWallet.fromMnemonic(faucetMnemonic, {
        prefix: "mycel",
      })) as OfflineDirectSigner;
      const faucetAddress = (await faucetSigner.getAccounts())[0].address;
      const rpc = import.meta.env.VITE_WS_TENDERMINT ?? "";
      const amount = import.meta.env.VITE_FAUCET_AMOUNT ?? "1000";
      const faucetClient = await SigningStargateClient.connectWithSigner(rpc, faucetSigner);

      await faucetClient
        .sendTokens(faucetAddress, mycelAccount?.address, [{ denom: "umycel", amount: amount }], {
          amount: [{ denom: "umycel", amount: "500" }],
          gas: "200000",
        })
        .then((res) => {
          setIsLoading(false);
          setTxResponse(res as DeliverTxResponse);
        })
        .catch((err) => {
          setIsShow(false);
          console.log(err);
        });
    }
  };

  return (
    <section className={className ?? ""}>
      <h3 className="text-xl text-black font-semibold px-1 py-2 flex flex-1 items-center border-b-2 border-black">
        <HandMetal className="opacity-70 mr-2" size={24} />
        Faucet
      </h3>
      <div>
        <Button className="btn-primary w-full py-2 mt-6" disabled={!isClaimable} onClick={claimFaucet}>
          Claim
        </Button>
        <TxModal isShow={isShow} setIsShow={setIsShow} txResponse={txResponse} isLoading={isLoading} />
      </div>
    </section>
  );
}
