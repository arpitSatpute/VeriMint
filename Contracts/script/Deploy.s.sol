// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/main/ProductNFT.sol";
import "../src/main/OrderManager.sol";
import "../src/main/EscrowMultiProduct.sol";

contract Deploy is Script {
    ProductNFT public productNFT;
    OrderManager public orderManager;
    EscrowMultiProduct public escrow;

    function run() external {
        // Load deployer
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deploying contracts with:", deployer);
        console2.log("Balance:", deployer.balance / 1e18, "ETH\n");

        vm.startBroadcast(deployerPrivateKey);

        // ========= DEPLOY CONTRACTS =========

        productNFT = new ProductNFT();
        console2.log("ProductNFT deployed:", address(productNFT));

        orderManager = new OrderManager(address(productNFT));
        console2.log("OrderManager deployed:", address(orderManager));

        escrow = new EscrowMultiProduct(address(orderManager), address(productNFT));
        console2.log("EscrowMultiProduct deployed:", address(escrow));

        // ========= SETUP PERMISSIONS =========

        productNFT.setEscrow(address(escrow));
        console2.log("Escrow address set in ProductNFT");

        orderManager.setEscrow(address(escrow));
        console2.log("Escrow address set in OrderManager");

        // Optional: Let Escrow control OrderManager (if you want auto-updates)
        // orderManager.transferOwnership(address(escrow));
        // console2.log("OrderManager ownership transferred to Escrow");

        vm.stopBroadcast();

        // ========= DEPLOYMENT SUMMARY =========

        console2.log("\nDeployment Summary");
        console2.log("===================");
        console2.log("ProductNFT        :", address(productNFT));
        console2.log("OrderManager      :", address(orderManager));
        console2.log("EscrowMultiProduct:", address(escrow));
        console2.log("Deployer (Owner)  :", deployer);
        console2.log("");

        // ========= VERIFICATION COMMANDS =========

        console2.log("Verification Commands (run after deployment):");
        console2.log("------------------------------------------------");

        // ProductNFT: no constructor args
        string memory cmd1 = string.concat(
            "forge verify-contract ",
            vm.toString(address(productNFT)),
            " src/ProductNFT.sol:ProductNFT ",
            "--verifier etherscan"
        );
        console2.logString(cmd1);

        // OrderManager: constructor(address productNFT)
        string memory args2 = string.concat(
            "$(cast abi-encode \"constructor(address)\" ",
            vm.toString(address(productNFT)),
            ")"
        );
        string memory cmd2 = string.concat(
            "forge verify-contract ",
            vm.toString(address(orderManager)),
            " src/OrderManager.sol:OrderManager \\\n",
            "  --constructor-args ", args2, " \\\n",
            "  --verifier etherscan"
        );
        console2.logString(cmd2);

        // EscrowMultiProduct: constructor(address orderManager, address productNFT)
        string memory args3 = string.concat(
            "$(cast abi-encode \"constructor(address,address)\" ",
            vm.toString(address(orderManager)),
            " ",
            vm.toString(address(productNFT)),
            ")"
        );
        string memory cmd3 = string.concat(
            "forge verify-contract ",
            vm.toString(address(escrow)),
            " src/EscrowMultiProduct.sol:EscrowMultiProduct \\\n",
            "  --constructor-args ", args3, " \\\n",
            "  --verifier etherscan"
        );
        console2.logString(cmd3);

        console2.log("\nTip: Add --verifier-url $ETHERSCAN_API_URL if needed.");
    }
}