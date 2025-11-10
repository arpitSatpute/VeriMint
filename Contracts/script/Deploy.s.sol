// script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/main/MultiProduct.sol";
import "../src/main/EscrowMultiProduct.sol";

contract Deploy is Script {
    MultiProduct public multiProduct;
    EscrowMultiProduct public escrow;

    function run() external {
        // Load private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying from:", deployer);
        console.log("Network:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy MultiProduct
        multiProduct = new MultiProduct();
        console.log("MultiProduct deployed at:", address(multiProduct));

        // Deploy Escrow with MultiProduct address
        escrow = new EscrowMultiProduct(address(multiProduct));
        console.log("EscrowMultiProduct deployed at:", address(escrow));

        // Link Escrow to MultiProduct
        multiProduct.setEscrowAddress(address(escrow));
        console.log("Escrow address set in MultiProduct");

        vm.stopBroadcast();

        // Final output
        console.log("\nDEPLOYMENT COMPLETE");
        console.log("========================================");
        console.log("MultiProduct:     ", address(multiProduct));
        console.log("EscrowMultiProduct:", address(escrow));
        console.log("========================================");
    }
}