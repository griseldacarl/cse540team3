// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract OrderBase {
    struct Item {
        string name;
        uint price;
        string quantity;
    }
}
// Contract is generated from the contract factory smart contract
contract OrderContract is OrderBase {
    // Admin address will be the wallet for the government official in-charge
    address admin;

    event PaymentStatusUpdated(address indexed businessAddress, bool newStatus);
    event FulfillmentStatusUpdated(address indexed businessAddress, bool newStatus);

    address businessAddress;
    bool paymentStatus;
    bool fulfillmentStatus;
    Item[] order;

    /*
    * Restrict access to the government admin or the business assigned to this order
    */
    modifier onlyAuthorized() {
        require(
            msg.sender == admin || msg.sender == businessAddress,
            "Only admin or assigned business can call this function"
        );
        _;
    }


    /*
     * Constructor sets the admin address, business address, and all relevant order details.
     * Parameters: _businessAddress, itemNames, itemPrices, itemQuantities
     * Returns: None
     */
    constructor(address _businessAddress,string[] memory itemNames, uint[] memory itemPrices, string[] memory itemQuantities) {
        // deployer is admin
        admin = msg.sender;
        require(_businessAddress != address(0), "Invalid business address");
        businessAddress = _businessAddress;
        paymentStatus = false;
        fulfillmentStatus = false;

        require(itemNames.length > 0, "Order must contain at least one item");

        require(
            itemNames.length == itemPrices.length &&
            itemNames.length == itemQuantities.length,
            "Item arrays must have matching lengths"
        );

        for (uint i = 0; i < itemNames.length; i++) {
            require(bytes(itemNames[i]).length > 0, "Item name required");
            require(itemPrices[i] > 0, "Item price must be greater than zero");
            require(bytes(itemQuantities[i]).length > 0, "Item quantity required");

            order.push(Item(itemNames[i], itemPrices[i], itemQuantities[i]));
        }
    }

    /*
     * Updates the payment status of the order
     * Access: Admin and/or business only
     * Parameters: newStatus
     * Returns: None
     */
    function updatePaymentStatus(bool newStatus) public onlyAuthorized {
        require(paymentStatus != newStatus, "Payment status already set");
        paymentStatus = newStatus;
        emit PaymentStatusUpdated(businessAddress, newStatus);
        
    }

    /*
     * Updates the fulfillment status of the order
     * Access: Admin and/or business only
     * Parameters: newStatus
     * Returns: None
     */
    function updateFulfillmentStatus(bool newStatus) public onlyAuthorized {
        require(fulfillmentStatus != newStatus, "Fulfillment status already set");
        fulfillmentStatus = newStatus;
        emit FulfillmentStatusUpdated(businessAddress, newStatus);
        
    }

    /*
     * Get the details of the order
     * Access: Public
     * Parameters: None
     * Returns: Array of all items in the order
     */
    function getOrder() public view returns (Item[] memory) {
      return order;
    }

    /* 
     * Get the payment status of the order
     * Access: Public
     * Parameters: None
     * Returns: bool of order payment status
     */ 
    function getPaymentStatus() public view returns (bool) {
        return paymentStatus;
    }

    /*
     * Get the fulfillment status of the order
     * Access: Public
     * Parameters: None
     * Returns: bool of order fulfillment status
     */
    function getFulfillmentStatus() public view returns (bool) {
        return fulfillmentStatus;
    }

    /*
     * Get the business address tied to this order
     * Access: Public
     * Parameters: None
     * Returns: business wallet address
     */
    function getBusinessAddress() public view returns (address) {
        return businessAddress;
    }

    /*
     * Get all item names in the order
     * Access: Public
     * Parameters: None
     * Returns: array of item names
     */
    function getItemNames() public view returns (string[] memory) {
        string[] memory names = new string[](order.length);

        for (uint i = 0; i < order.length; i++) {
            names[i] = order[i].name;
        }

        return names;
    }

    /*
     * Get all item prices in the order
     * Access: Public
     * Parameters: None
     * Returns: array of item prices
     */
    function getItemPrices() public view returns (uint[] memory) {
        uint[] memory prices = new uint[](order.length);

        for (uint i = 0; i < order.length; i++) {
            prices[i] = order[i].price;
        }

        return prices;
    }

    /*
     * Get all item quantities in the order
     * Access: Public
     * Parameters: None
     * Returns: array of item quantities
     */
    function getItemQuantities() public view returns (string[] memory) {
        string[] memory quantities = new string[](order.length);

        for (uint i = 0; i < order.length; i++) {
            quantities[i] = order[i].quantity;
        }

        return quantities;
    }

}
