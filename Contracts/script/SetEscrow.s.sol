// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/main/OrderManager.sol";

contract SetEscrow is Script {
    // Sepolia mainnet addresses from last deployment
    address constant ORDER_MANAGER = 0xD1CE249df47ACE2fBDC70A537a255f51721bb94B;
    address constant ESCROW = 0x399faed3b0B6601B5FdA2C62EF4Be9Af799B7349;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console2.log("Setting Escrow address in OrderManager");
        console2.log("OrderManager:", ORDER_MANAGER);
        console2.log("Escrow:", ESCROW);

        vm.startBroadcast(deployerPrivateKey);

        OrderManager(ORDER_MANAGER).setEscrow(ESCROW);
        
        console2.log("Escrow address set successfully!");

        vm.stopBroadcast();
    }
}
