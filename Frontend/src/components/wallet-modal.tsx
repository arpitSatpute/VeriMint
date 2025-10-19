import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useConnect } from "wagmi";
import type { Connector } from "wagmi";
import { useState } from "react";

interface WalletDropdownProps {
  address?: string;
}

export const WalletDropdown = ({ address }: WalletDropdownProps) => {
  const { connect, connectors, isPending } = useConnect();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    setIsOpen(false);
  };

  const getWalletName = (connectorId: string) => {
    const names: Record<string, string> = {
      injected: "Browser Wallet",
      metaMask: "MetaMask",
      walletConnect: "WalletConnect",
      coinbaseWallet: "Coinbase Wallet",
      brave: "Brave Wallet",
    };
    return names[connectorId] || connectorId;
  };

  const getWalletIcon = (connectorId: string) => {
    const icons: Record<string, string> = {
      injected: "🔌",
      metaMask: "🦊",
      walletConnect: "💙",
      coinbaseWallet: "☁️",
      brave: "⚡",
    };
    return icons[connectorId] || "💼";
  };

  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <DropdownTrigger>
        <Button
          className="text-sm font-normal bg-default-100"
          variant="flat"
          isLoading={isPending}
        >
          {address ? "💼" : "Connect Wallet"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Wallet selection"
        items={connectors.map((connector) => ({
          key: connector.id,
          label: `${getWalletIcon(connector.id)} ${getWalletName(connector.id)}`,
          description: connector.name,
        }))}
        onAction={(key) => {
          const connector = connectors.find((c) => c.id === String(key));
          if (connector) {
            handleConnect(connector);
          }
        }}
        className="min-w-[250px]"
      >
        {(item: any) => (
          <DropdownItem
            key={item.key}
            description={item.description}
            className="py-3"
          >
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};
