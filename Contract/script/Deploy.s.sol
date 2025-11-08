pragma solidity ^0.8.17;

import "../lib/forge-std/src/Script.sol";
import "../contracts/src/MultiProduct.sol";
import "../contracts/src/EscrowMultiProduct.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY"); // set PRIVATE_KEY in env
        string memory rpc = vm.envString("RPC_URL"); // optional, used by forge when broadcasting

        vm.startBroadcast(pk);

        // Deploy MultiProduct
        MultiProduct multi = new MultiProduct();

        // Deploy Escrow and point to MultiProduct
        EscrowMultiProduct escrow = new EscrowMultiProduct(address(multi));

        // Set escrow address in MultiProduct
        multi.setEscrowAddress(address(escrow));

        vm.stopBroadcast();

        // Log deployed addresses (foundry will also print tx info)
        console.log("MultiProduct deployed at:", address(multi));
        console.log("EscrowMultiProduct deployed at:", address(escrow));
    }
}