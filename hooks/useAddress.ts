import { Network } from "@/lib/types";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { useEffect } from "react";

export const useAddress = (): {
  address: string;
} => {
  const account = useMidenSdkStore((state) => state.account);
  const network = useMidenSdkStore((state) => state.networkType);
  const setAccount = useMidenSdkStore((state) => state.setAccount);
  useEffect(() => {
    const changeAddressForNetwork = async () => {
      if (account) {
        const { Address, AccountInterface } = await import(
          "@miden-sdk/miden-sdk"
        );
        const accountId = Address.fromBech32(account).accountId();
        const networkId = await networkFromNetworkType(network!);
        const newAddress = accountId.toBech32(
          networkId,
          AccountInterface.BasicWallet,
        );
        setAccount(newAddress);
      }
    };
    changeAddressForNetwork();
  }, [network]);

  return { address: account };
};

const networkFromNetworkType = async (networkType: Network) => {
  const { NetworkId } = await import("@miden-sdk/miden-sdk");
  if (networkType === Network.Testnet) {
    return NetworkId.testnet();
  } else if (networkType === Network.Devnet) {
    return NetworkId.devnet();
  } else if (networkType === Network.Localnet) {
    return NetworkId.custom("mlcl");
  }
};
