import React ,{useState} from 'react';
import { contractGovernmentAddress } from "../GovernmentABI/contractGovernmentAddress";
import { contractGovernmentABI } from "../GovernmentABI/contractGovernmentABI"; 
import { ethers } from "ethers";

function Main() {
  return (
    <div>
        <h1>Government Supply Chain App</h1>
     <button onClick={async () => {
        if (typeof window.ethereum !== "undefined") {
          try {
            // Request account access if needed
            await window.ethereum.request({ method: "eth_requestAccounts" });
            
            // Create a new provider and signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = provider.getSigner();
            
            // Create a contract instance
            const contract = new ethers.Contract(contractGovernmentAddress, contractGovernmentABI, signer);
           
            console.log("Connected to MetaMask and contract instance created");
            console.log("Contract Address:", contractGovernmentAddress);
          
          } catch (error) {
            console.error("Error connecting to MetaMask or calling contract:", error);
          }
        } else {
          console.error("MetaMask is not installed");
        }
      }}>
        Test Connection
      </button>

    </div>
  )
}

export default Main