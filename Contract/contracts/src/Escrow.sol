// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { IUniqueProduct } from "../interfaces/IUniqueProduct.sol";

contract Escrow {

    IUniqueProduct public uniqueProduct;
    address owner;
    // address public buyer;
    // address public merchant;
    uint256 public amountHeld;
    

    struct TraceNft {
        address buyer;
        address merchant;
        uint256 price;
    }
    // token and funding
    mapping (uint256 => bool) isFunded;
    // token and release
    mapping (uint256 => bool) isReleased;
    // token and refund
    mapping (uint256 => bool) isRefunded;

    mapping (uint256 => TraceNft) details;

    mapping (address => uint256) merchantAmount;

    // ALL RELATED EVENTS    
    event EscrowFunded(uint256 tokenId, address buyer, address merchant, uint256 amount);
    event FundReleased(uint256 tokenId, address buyer, address merchant, uint256 amount);


    constructor(address _uniqueProduct, address _owner){

        uniqueProduct = IUniqueProduct(_uniqueProduct);
        owner = _owner;
    }

    function fundEscrow(uint256 _tokenId) external payable {
    require(!uniqueProduct.isRedeemed(_tokenId), "Already Redeemed Nft");
        require(!isFunded[_tokenId], "Already funded for this Nft");
        require(msg.value > 0, "Provide valid amount");
        require(uniqueProduct.isListed(_tokenId), "Not Listed for Sell");
        (address _merchant, uint256 _price) = uniqueProduct.getListing(_tokenId);

        require(msg.value == _price, "Not Valid Amount");
        
    
        details[_tokenId] = TraceNft ({
            buyer : msg.sender,
            merchant: _merchant,
            price : msg.value
        });

        amountHeld += msg.value;
        merchantAmount[_merchant] += msg.value;
        
        isFunded[_tokenId] = true;
        isReleased[_tokenId] = false;
        isRefunded[_tokenId] = false;

        uniqueProduct.buyNft(_tokenId, msg.sender);
        emit EscrowFunded(_tokenId, msg.sender, _merchant, _price);
    }

    function releaseFundToMerchant(uint256 _tokenId) external {
        require(!isReleased[_tokenId], "Already Released fund for this");
        require(!isRefunded[_tokenId], "Order Cancelled, Amount Refunded");
        require(isFunded[_tokenId], "No fund found");
    TraceNft memory trace = details[_tokenId];
        require(msg.sender == trace.buyer, "Not Owner of Nft");
        address merchant = trace.merchant;
        require(merchantAmount[merchant] >= trace.price, "Not sufficient amount");
        payable(merchant).transfer(trace.price);
        amountHeld -= trace.price;
    uniqueProduct.redeemNft(_tokenId, trace.buyer);

        isReleased[_tokenId] = true;
        
        isFunded[_tokenId] = false;
        isRefunded[_tokenId] = false;

        emit FundReleased(_tokenId, trace.buyer, trace.merchant, trace.price);

    }

    // from merchant to buyer
    function refundToBuyer(uint256 _tokenId) external {
        require(!isRefunded[_tokenId], "Already Refunded");
        require(!isReleased[_tokenId], "Order Completed, Unable to refund for this");
        require(isFunded[_tokenId], "No fund found");
    TraceNft memory trace = details[_tokenId];
        require(msg.sender == trace.merchant, "Not a merchant for current Nft");
        address merchant = trace.merchant;
        require(merchantAmount[merchant] >= trace.price, "Not sufficient amount");
        merchantAmount[merchant] -= trace.price;
        payable(trace.buyer).transfer(trace.price);
        amountHeld -= trace.price;
    uniqueProduct.refundNft(_tokenId, merchant, trace.buyer);

        isFunded[_tokenId] = false;
        isReleased[_tokenId] = false;
        isRefunded[_tokenId] = true;

        emit FundReleased(_tokenId, trace.buyer, merchant, trace.price);
        // Message from frontend wanna list again
    }

    function emergencyWithdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
        amountHeld = 0;
    }

}