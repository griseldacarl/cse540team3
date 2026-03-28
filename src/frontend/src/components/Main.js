import React, { useState } from "react";
import { orderFactoryAddress } from "../GovernmentABI/orderFactoryAddress";
import { orderFactoryABI } from "../GovernmentABI/orderFactoryABI";
import { ethers } from "ethers";

/*
 * This component is the main frontend for the Government Supply Chain app.
 * It connects to MetaMask, reads order data from the deployed smart contract,
 * tests the backend database connection, and displays both blockchain-based
 * order information and database-stored business records in one interface.
 */

function Main() {
  const [walletAddress, setWalletAddress] = useState("");
  const [orderAddresses, setOrderAddresses] = useState([]);
  const [statusMessage, setStatusMessage] = useState("Not connected");
  const [networkInfo, setNetworkInfo] = useState("");
  const [businessData, setBusinessData] = useState(null);
  const [dbStatus, setDbStatus] = useState("");

  /*
   * The database helper exercises the backend API and updates the UI with either the returned
   * business records or an error state. This gives the page a quick connectivity check for the
   * MySQL-backed portion of the project without mixing that logic into the blockchain flow.
   */
  // This loads the businesses from the database
  const loadBusinesses = async () => {
    try {
      setDbStatus("Checking database...");
      const response = await fetch("http://localhost:5000/api/businesses");
      console.log("Response from database: ", response);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log("Businesses:", data);
      setBusinessData(data);
      setDbStatus("Database is up! Fetched businesses successfully.");
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setDbStatus(`Database test failed: ${error.message}`);
      setBusinessData(null);
    }
  };

  /*
   * The wallet-and-orders helper drives the blockchain side of the app. 
   * It connects the user's wallet, checks the currently selected network and then reads the
   * list of order contract addresses so the UI can present the on-chain order state.
   */
  const connectAndLoadOrders = async () => {
    console.log("window.ethereum =", window.ethereum);

    // check if the browser has MetaMask browser extension
    if (!window.ethereum) {
      console.error("MetaMask is not installed");
      setStatusMessage("MetaMask is not installed. Open in Chrome/Edge with MetaMask.");
      alert("MetaMask is not installed. Open this app in Chrome/Edge and install the MetaMask extension.");
      return;
    }

    try {
      setStatusMessage("Connecting to MetaMask...");

      // Connect wallet
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create provider + signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentWalletAddress = await signer.getAddress();

      setWalletAddress(currentWalletAddress);

      console.log("Connected wallet:", currentWalletAddress);
      console.log("OrderFactory address:", orderFactoryAddress);
      console.log("OrderFactory ABI:", orderFactoryABI);

      // 1) Check network
      const network = await provider.getNetwork();
      const networkText = `${network.name} (chainId: ${network.chainId.toString()})`;
      setNetworkInfo(networkText);

      console.log("Network:", network.name);
      console.log("Chain ID:", network.chainId.toString());

      // 2) Check if contract code exists at the address
      const code = await provider.getCode(orderFactoryAddress);
      console.log("Runtime code at OrderFactory address:", code);
      console.log("Runtime code length:", code.length);

      if (code === "0x") {
        setStatusMessage("No contract code found at this address on the current MetaMask network.");
        alert("No contract found at orderFactoryAddress on the selected MetaMask network.");
        return;
      }

      // 3) Make a raw low-level call to getAllOrders()
      const iface = new ethers.Interface(orderFactoryABI);
      const callData = iface.encodeFunctionData("getAllOrders", []);
      console.log("Encoded getAllOrders() call data:", callData);

      const rawResult = await provider.call({
        to: orderFactoryAddress,
        data: callData,
      });

      console.log("Raw eth_call result for getAllOrders():", rawResult);

      if (rawResult === "0x") {
        setStatusMessage("Contract exists, but getAllOrders() returned raw 0x. Function likely missing on deployed bytecode.");
        alert("Contract code exists, but getAllOrders() returned raw 0x. Check that the deployed contract really contains getAllOrders().");
        return;
      }

      // Create contract instance
      const contract = new ethers.Contract(
        orderFactoryAddress,
        orderFactoryABI,
        signer
      );

      // Normal ethers call
      const orders = await contract.getAllOrders();

      console.log("Decoded order contract addresses:", orders);

      if (!orders || orders.length === 0) {
        setOrderAddresses([]);
        setStatusMessage("Connected successfully. No orders found yet.");
        return;
      }

      setOrderAddresses(orders);
      setStatusMessage("Connected and loaded all orders successfully!");
    } catch (error) {
      console.error("Error connecting to MetaMask or reading contract:", error);
      setStatusMessage("Failed to load orders. Check console.");
      alert("Failed to load orders. Check the browser console (F12).");
    }
  };

  /*
   * The rendered layout groups the app into three user-facing views: connection status,
   * blockchain and backend metadata, and the discovered order list.
   */
  return (
    <div style={styles.container}>
      <h1>Government Supply Chain App</h1>

      <button style={styles.button} onClick={connectAndLoadOrders}>
        Connect Wallet & Load Orders
      </button>

      <button style={{ ...styles.button, marginLeft: "10px" }} onClick={loadBusinesses}>
        Test Database
      </button>

      <div style={styles.card}>
        <h2>Status</h2>
        <p>{statusMessage}</p>
      </div>

      <div style={styles.card}>
        <h2>Connection Info</h2>
        <p><strong>Wallet Address:</strong> {walletAddress || "Not connected"}</p>
        <p><strong>Network:</strong> {networkInfo || "Not connected"}</p>
        <p><strong>OrderFactory Address:</strong> {orderFactoryAddress}</p>
        <p><strong>Total Orders:</strong> {orderAddresses.length}</p>
      </div>

      <div style={styles.card}>
        <h2>Database Test</h2>
        <p>{dbStatus || "Click 'Test Database' to check"}</p>
        {businessData && (
          <div>
            <h3>Businesses:</h3>
            <ul>
              {businessData.map((b, i) => (
                <li key={i}>{b.name} (ID: {b.id})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <h2>All Orders</h2>

      {orderAddresses.length > 0 ? (
        orderAddresses.map((address, index) => (
          <div key={index} style={styles.card}>
            <p><strong>Order #{index + 1}</strong></p>
            <p><strong>Order Contract Address:</strong> {address}</p>
          </div>
        ))
      ) : (
        <div style={styles.card}>
          <p>No orders found yet.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    marginBottom: "20px",
    cursor: "pointer",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    backgroundColor: "#f9f9f9",
  },
};

export default Main;