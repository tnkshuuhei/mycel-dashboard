import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useClient } from "@/hooks/useClient";

export default function useBalance() {
  const { mycelAccount } = useWallet();
  const client = useClient();
  const [balances, setBalances] = useState<any | undefined>(undefined);

  useEffect(() => {
    const fetchBalance = async (address: string) => {
      if (!address) return;
      const res = await client.CosmosBankV1Beta1.query.queryAllBalances(address);
      if (res.status === 200 && res.data.balances) setBalances(res.data.balances);
    };

    if (mycelAccount?.address) {
      fetchBalance(mycelAccount.address);
    }
  }, [mycelAccount?.address]);

  return { balances };
}
