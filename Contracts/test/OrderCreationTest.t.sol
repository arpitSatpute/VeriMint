// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/main/ProductNFT.sol";
import "../src/main/OrderManager.sol";
import "../src/main/EscrowMultiProduct.sol";

contract OrderCreationTest is Test {
    ProductNFT public productNFT;
    OrderManager public orderManager;
    EscrowMultiProduct public escrow;

    address owner = address(0x999);
    address merchant = address(0x1);
    address buyer = address(0x2);

    uint256 constant PRICE = 1 ether;
    uint256 constant SUPPLY = 100;
    bytes32 constant NULL_HASH = keccak256(abi.encodePacked("null"));

    function setUp() public {
        // Deploy as owner address
        vm.prank(owner);
        productNFT = new ProductNFT();
        
        vm.prank(owner);
        orderManager = new OrderManager(address(productNFT));
        
        vm.prank(owner);
        escrow = new EscrowMultiProduct(address(orderManager), address(productNFT));

        // Set escrow addresses
        vm.prank(owner);
        productNFT.setEscrow(address(escrow));
        
        vm.prank(owner);
        orderManager.setEscrow(address(escrow));
    }

    // Test 1: Virtual Product - Immediate Auto-Release
    function test_01_VirtualProductAutoRelease() public {
        console.log("\n========== TEST 1: VIRTUAL PRODUCT (AUTO-RELEASE) ==========");
        
        // Step 1: Merchant mints virtual product
        console.log("\n[Step 1] Merchant mints virtual product");
        vm.prank(merchant);
        uint256 tokenId = productNFT.mintProduct(
            SUPPLY,
            PRICE,
            "Digital NFT",
            "A virtual digital product",
            keccak256(abi.encodePacked("virtual")),
            "ipfs://virtual-product"
        );
        console.log("  TokenId: %d", tokenId);
        console.log("  Supply: %d", SUPPLY);
        console.log("  Price: %d wei (1 ETH)", PRICE);

        // Step 2: Merchant lists product
        console.log("\n[Step 2] Merchant lists product");
        vm.prank(merchant);
        productNFT.listProduct(tokenId);
        assertTrue(productNFT.isProductListed(tokenId), "Product should be listed");
        console.log("  Product listed successfully");

        // Step 3: Buyer creates order with NULL hash
        console.log("\n[Step 3] Buyer creates order with NULL hash");
        uint256 quantity = 5;
        uint256 totalPrice = PRICE * quantity;
        
        console.log("  Buyer: %s", vm.toString(buyer));
        console.log("  Quantity: %d", quantity);
        console.log("  Total Price: %d wei (5 ETH)", totalPrice);
        console.log("  Delivery Hash: NULL (keccak256('null'))");

        vm.deal(buyer, totalPrice);
        vm.prank(buyer);
        uint256 orderId = escrow.fundEscrow{value: totalPrice}(
            tokenId,
            quantity,
            NULL_HASH
        );
        
        console.log("  Order ID: %d", orderId);
        assertEq(orderId, 0, "First order should have ID 0");

        // Step 4: Verify order was created
        console.log("\n[Step 4] Verify order details");
        EscrowMultiProduct.TraceNft memory order = escrow.getOrderDetails(orderId);
        
        assertEq(order.buyer, buyer, "Order buyer should be correct");
        assertEq(order.merchant, merchant, "Order merchant should be correct");
        assertEq(order.tokenId, tokenId, "Order tokenId should be correct");
        assertEq(order.supply, quantity, "Order supply should be correct");
        assertEq(order.totalPrice, totalPrice, "Order total price should be correct");
        console.log("  Order details verified");

        // Step 5: Verify funds were auto-released (virtual product)
        console.log("\n[Step 5] Verify auto-release (virtual product)");
        bool isFunded = escrow.isFunded(orderId);
        bool isReleased = escrow.isReleased(orderId);
        
        console.log("  Funds released: %s", isReleased ? "YES" : "NO");
        console.log("  Order funded: %s", isFunded ? "YES" : "NO");
        
        assertTrue(isReleased, "Funds should be auto-released for virtual product");
        assertFalse(isFunded, "Order should not be funded after release");

        // Step 6: Verify escrow balance
        console.log("\n[Step 6] Verify escrow balance");
        uint256 merchantBalance = escrow.merchantAmount(merchant);
        uint256 totalHeld = escrow.amountHeld();
        
        console.log("  Amount held in escrow: %d wei", totalHeld);
        console.log("  Merchant balance in escrow: %d wei", merchantBalance);
        
        assertEq(totalHeld, 0, "No funds should be held in escrow after release");
        assertEq(merchantBalance, 0, "Merchant balance should be 0 after release");

        // Step 7: Verify supply was reserved and used
        console.log("\n[Step 7] Verify supply reservation");
        uint256 finalAvailable = productNFT.availableSupply(tokenId);
        
        console.log("  Initial available: %d", SUPPLY);
        console.log("  Final available: %d", finalAvailable);
        console.log("  Reserved/Used: %d", SUPPLY - finalAvailable);
        
        assertEq(finalAvailable, SUPPLY - quantity, "Supply should be reserved");

        console.log("\n[PASS] TEST 1 PASSED: Virtual product order auto-released successfully\n");
    }

    // Test 2: Physical Product with NULL Hash - Immediate Auto-Release
    function test_02_PhysicalProductNullHashAutoRelease() public {
        console.log("\n========== TEST 2: PHYSICAL PRODUCT WITH NULL HASH (AUTO-RELEASE) ==========");
        
        // Step 1: Merchant mints physical product
        console.log("\n[Step 1] Merchant mints physical product");
        vm.prank(merchant);
        uint256 tokenId = productNFT.mintProduct(
            SUPPLY,
            PRICE,
            "Physical Item",
            "A physical product",
            keccak256(abi.encodePacked("physical")),
            "ipfs://physical-product"
        );
        console.log("  TokenId: %d", tokenId);
        console.log("  Type: Physical");

        // Step 2: Merchant lists product
        console.log("\n[Step 2] Merchant lists product");
        vm.prank(merchant);
        productNFT.listProduct(tokenId);
        assertTrue(productNFT.isProductListed(tokenId), "Product should be listed");
        console.log("  Product listed successfully");

        // Step 3: Buyer creates order with NULL hash (no shipping needed)
        console.log("\n[Step 3] Buyer creates order with NULL hash (no shipping)");
        uint256 quantity = 3;
        uint256 totalPrice = PRICE * quantity;
        
        console.log("  Buyer: %s", vm.toString(buyer));
        console.log("  Quantity: %d", quantity);
        console.log("  Total Price: %d wei (3 ETH)", totalPrice);
        console.log("  Delivery Hash: NULL (no shipping address)");

        vm.deal(buyer, totalPrice);
        vm.prank(buyer);
        uint256 orderId = escrow.fundEscrow{value: totalPrice}(
            tokenId,
            quantity,
            NULL_HASH
        );
        
        console.log("  Order ID: %d", orderId);
        assertEq(orderId, 0, "First order should have ID 0");

        // Step 4: Verify order was created
        console.log("\n[Step 4] Verify order details");
        EscrowMultiProduct.TraceNft memory order = escrow.getOrderDetails(orderId);
        
        assertEq(order.buyer, buyer, "Order buyer should be correct");
        assertEq(order.merchant, merchant, "Order merchant should be correct");
        assertEq(order.supply, quantity, "Order supply should be correct");
        console.log("  Order details verified");

        // Step 5: Verify funds were auto-released (NULL hash = no shipping required)
        console.log("\n[Step 5] Verify auto-release (NULL hash)");
        bool isFunded = escrow.isFunded(orderId);
        bool isReleased = escrow.isReleased(orderId);
        
        console.log("  Funds released: %s", isReleased ? "YES" : "NO");
        console.log("  Order funded: %s", isFunded ? "YES" : "NO");
        
        assertTrue(isReleased, "Funds should be auto-released with NULL hash");
        assertFalse(isFunded, "Order should not be funded after release");

        // Step 6: Verify escrow balance is zero
        console.log("\n[Step 6] Verify escrow state");
        uint256 totalHeld = escrow.amountHeld();
        
        console.log("  Amount held in escrow: %d wei", totalHeld);
        assertEq(totalHeld, 0, "No funds should be held after release");

        console.log("\n[PASS] TEST 2 PASSED: Physical product with NULL hash auto-released successfully\n");
    }

    // Test 3: Physical Product with Address Hash - Manual Release
    function test_03_PhysicalProductAddressHashManualRelease() public {
        console.log("\n========== TEST 3: PHYSICAL PRODUCT WITH ADDRESS HASH (MANUAL RELEASE) ==========");
        
        // Step 1: Merchant mints physical product
        console.log("\n[Step 1] Merchant mints physical product");
        vm.prank(merchant);
        uint256 tokenId = productNFT.mintProduct(
            SUPPLY,
            PRICE,
            "Physical Item",
            "A physical product with shipping",
            keccak256(abi.encodePacked("physical")),
            "ipfs://physical-shipped"
        );
        console.log("  TokenId: %d", tokenId);

        // Step 2: Merchant lists product
        console.log("\n[Step 2] Merchant lists product");
        vm.prank(merchant);
        productNFT.listProduct(tokenId);
        console.log("  Product listed successfully");

        // Step 3: Create address hash
        console.log("\n[Step 3] Generate delivery address hash");
        string memory deliveryAddress = "123 Main Street, New York, NY 10001, USA";
        bytes32 addressHash = keccak256(abi.encodePacked(deliveryAddress));
        
        console.log("  Shipping Address: %s", deliveryAddress);
        console.log("  Address Hash: %s", vm.toString(addressHash));

        // Step 4: Buyer creates order with ADDRESS hash
        console.log("\n[Step 4] Buyer creates order with ADDRESS hash");
        uint256 quantity = 2;
        uint256 totalPrice = PRICE * quantity;
        
        console.log("  Buyer: %s", vm.toString(buyer));
        console.log("  Quantity: %d", quantity);
        console.log("  Total Price: %d wei (2 ETH)", totalPrice);
        console.log("  Delivery Hash: Address-based hash");

        vm.deal(buyer, totalPrice);
        vm.prank(buyer);
        uint256 orderId = escrow.fundEscrow{value: totalPrice}(
            tokenId,
            quantity,
            addressHash
        );
        
        console.log("  Order ID: %d", orderId);
        assertEq(orderId, 0, "First order should have ID 0");

        // Step 5: Verify funds NOT auto-released
        console.log("\n[Step 5] Verify funds are HELD (not auto-released)");
        bool isFunded = escrow.isFunded(orderId);
        bool isReleased = escrow.isReleased(orderId);
        uint256 escrowBalance = escrow.amountHeld();
        
        console.log("  Funds released: %s", isReleased ? "YES" : "NO");
        console.log("  Order funded: %s", isFunded ? "YES" : "NO");
        console.log("  Amount held in escrow: %d wei (2 ETH)", escrowBalance);
        
        assertTrue(isFunded, "Order should still be funded");
        assertFalse(isReleased, "Funds should NOT be auto-released with address hash");
        assertEq(escrowBalance, totalPrice, "Escrow should hold the funds");

        // Step 6: Merchant updates delivery status
        console.log("\n[Step 6] Merchant updates delivery status to InTransit");
        vm.prank(merchant);
        escrow.updateDelivery(orderId, IOrderManager.DeliveryStatus.InTransit);
        console.log("  Delivery status updated");

        EscrowMultiProduct.TraceNft memory orderAfterUpdate = escrow.getOrderDetails(orderId);
        assertEq(uint(orderAfterUpdate.deliveryStatus), uint(IOrderManager.DeliveryStatus.InTransit), "Status should be InTransit");

        // Step 7: Buyer confirms delivery
        console.log("\n[Step 7] Buyer confirms delivery");
        vm.prank(buyer);
        escrow.confirmDelivery(orderId);
        console.log("  Delivery confirmed");

        EscrowMultiProduct.TraceNft memory orderAfterConfirm = escrow.getOrderDetails(orderId);
        assertTrue(orderAfterConfirm.isDelivered, "Order should be marked as delivered");
        assertEq(uint(orderAfterConfirm.deliveryStatus), uint(IOrderManager.DeliveryStatus.Delivered), "Status should be Delivered");

        // Step 8: Verify funds NOW released
        console.log("\n[Step 8] Verify funds are NOW RELEASED");
        isReleased = escrow.isReleased(orderId);
        isFunded = escrow.isFunded(orderId);
        escrowBalance = escrow.amountHeld();
        
        console.log("  Funds released: %s", isReleased ? "YES" : "NO");
        console.log("  Order funded: %s", isFunded ? "YES" : "NO");
        console.log("  Amount held in escrow: %d wei", escrowBalance);
        
        assertTrue(isReleased, "Funds should be released after delivery confirmation");
        assertFalse(isFunded, "Order should not be funded after release");
        assertEq(escrowBalance, 0, "Escrow should have no funds after release");

        // Step 9: Summary
        console.log("\n[Summary] Order Lifecycle");
        console.log("  1. Order created with address hash");
        console.log("  2. Funds held in escrow: 2 ETH");
        console.log("  3. Merchant marked as InTransit");
        console.log("  4. Buyer confirmed delivery");
        console.log("  5. Funds released to merchant: 2 ETH");
        console.log("  6. Order complete");

        console.log("\n[PASS] TEST 3 PASSED: Physical product with address hash manual release working correctly\n");
    }
}
