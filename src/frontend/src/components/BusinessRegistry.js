import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// ABI imports
import { businessRegistryAddress } from "../GovernmentABI/businessRegistryAddress";
import { businessRegistryABI } from "../GovernmentABI/businessRegistryABI";

// MUI imports
import {
  Typography,
  Box,
  TextField,
  FormControl,
  Select,
  Paper,
  Button,
  Card,
  MenuItem,
  Alert,
} from "@mui/material";

function BusinessRegistry() {

  // Search state
  const [searchParam, setSearchParam] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [searchResult, setSearchResult] = useState(null);
  const [lastSearch, setLastSearch] = useState(null);

  // Business data
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  // Status / health indicators
  const [dbColor, setDbColor] = useState("Red");
  const [walletColor, setWalletColor] = useState("Red");
  const [dbStatus, setDbStatus] = useState("");

  // Register Business UI state
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationWalletAddress, setRegistrationWalletAddress] = useState("");

  // Update Wallet UI state
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Update Wallet Address form state
  const [oldBusinessWalletAddress, setOldBusinessWalletAddress] = useState("");
  const [newBusinessWalletAddress, setNewBusinessWalletAddress] = useState("");
  const [businessId, setBusinessId] = useState("");

  const selectedBusiness =
    businesses?.find((business) => business.id === selectedBusinessId) || null;

  /*
   * Load businesses from backend API to test DB connectivity
   */
  const loadBusinesses = async () => {
    try {
      setDbStatus("Checking database...");

      const response = await fetch("http://localhost:5001/api/businesses");
      console.log("Response from database: ", response);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Businesses:", data);

      setBusinesses(data);
      setDbStatus("Database is up! Fetched businesses successfully.");
      setDbColor("Green");
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setDbStatus(`Database test failed: ${error.message}`);
      setBusinesses([]);
      setDbColor("Red");
    }
  };

  /*
   * Updates the address of the wallet for the specified business at the current given address
   * on the blockchain and also in the database.
   */
  async function updateWalletAddress() {
    try {
      setUpdateError("");
      setUpdateSuccess(false);
      setIsUpdating(true);

      if (!oldBusinessWalletAddress) {
        throw new Error("Current wallet address is required.");
      }

      if (!newBusinessWalletAddress) {
        throw new Error("New wallet address is required.");
      }

      if (!businessId) {
        throw new Error("Business ID is required.");
      }

      if (!ethers.isAddress(oldBusinessWalletAddress)) {
        throw new Error("Current wallet address is invalid.");
      }

      if (!ethers.isAddress(newBusinessWalletAddress)) {
        throw new Error("New wallet address is invalid.");
      }

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed.");
      }

      // Create provider + signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const currentWalletAddress = await signer.getAddress();

      setWalletColor("Green");

      const businessRegistryContract = new ethers.Contract(
        businessRegistryAddress,
        businessRegistryABI,
        signer
      );

      const adminAddress = await businessRegistryContract.admin();
      console.log("Admin wallet:", adminAddress);
      console.log("Using wallet:", currentWalletAddress);

      // Send transaction
      const tx = await businessRegistryContract.updateBusinessWallet(
        oldBusinessWalletAddress,
        newBusinessWalletAddress,
        businessId
      );

      console.log("Transaction sent:", tx.hash);
      await tx.wait();

      console.log("Wallet updated successfully!");
      setUpdateSuccess(true);
    } catch (error) {
      console.error("Failed to update wallet address:", error);

      const message =
        error?.reason ||
        error?.data?.message ||
        error?.message ||
        "Failed to update wallet address.";

      setUpdateError(message);
    } finally {
      setIsUpdating(false);
      setBusinessId("");
      setOldBusinessWalletAddress("");
      setNewBusinessWalletAddress("");
    }
  }

  // register new business to the blockchain
  async function registerBusiness() {
    try {
        setRegisterError("");
        setRegistrationSuccess(false);
        setIsRegistering(true);

        if (!selectedBusiness) {
        throw new Error("Please select a business first.");
        }

        if (!registrationWalletAddress) {
        throw new Error("Please enter a wallet address.");
        }

        if (!ethers.isAddress(registrationWalletAddress)) {
        throw new Error("Please enter a valid wallet address.");
        }

        if (!window.ethereum) {
        throw new Error("MetaMask is not installed.");
        }

        // Create provider + signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const currentWalletAddress = await signer.getAddress();

        setWalletColor("Green");

        const businessRegistryContract = new ethers.Contract(
        businessRegistryAddress,
        businessRegistryABI,
        signer
        );

        const adminAddress = await businessRegistryContract.admin();
        console.log("Admin wallet:", adminAddress);
        console.log("Using wallet:", currentWalletAddress);

        const exists = await businessRegistryContract.businessExists(
        selectedBusiness.business_name
        );

        if (exists) {
        throw new Error(
            `${selectedBusiness.business_name} is already registered.`
        );
        }

        // Send transaction
        const tx = await businessRegistryContract.registerBusiness(
        registrationWalletAddress,
        selectedBusiness.business_name,
        selectedBusiness.id
        );

        console.log("Transaction sent:", tx.hash);
        await tx.wait();

        console.log("Business registered successfully!");
        setRegistrationSuccess(true);
    } catch (error) {
        console.error("Failed to register business:", error);

        const message =
        error?.reason ||
        error?.data?.message ||
        error?.message ||
        "Failed to register business.";

        setRegisterError(message);
    } finally {
        setIsRegistering(false);
    }
    }

  // Search business by name / id / wallet
  async function searchBusiness(input, byType) {
    try {
        if (!input) return null;

        if (!window.ethereum) {
        throw new Error("MetaMask is not installed.");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const businessRegistryContract = new ethers.Contract(
        businessRegistryAddress,
        businessRegistryABI,
        provider
        );

        let walletAddress = "";
        let businessData;

        switch (byType) {
        case "name": {
            walletAddress = await businessRegistryContract.getBusinessByName(input);
            businessData = await businessRegistryContract.getBusinessByAddress(
            walletAddress
            );
            break;
        }

        case "id": {
            walletAddress = await businessRegistryContract.getBusinessById(input);
            businessData = await businessRegistryContract.getBusinessByAddress(
            walletAddress
            );
            break;
        }

        case "wallet": {
            if (!ethers.isAddress(input)) {
            throw new Error("Please enter a valid wallet address.");
            }

            walletAddress = input;
            businessData = await businessRegistryContract.getBusinessByAddress(
            walletAddress
            );
            break;
        }

        default:
            return null;
        }

        return {
        business_name: businessData.name,
        id: businessData.id,
        wallet_address: walletAddress,
        };
    } catch (error) {
        console.error("Blockchain search failed:", error);
        return null;
    }
    }

  const resetRegistrationForm = () => {
    setSelectedBusinessId("");
    setRegistrationSuccess(false);
    setRegisterError("");
  };

  const resetUpdateForm = () => {
    setBusinessId("");
    setOldBusinessWalletAddress("");
    setNewBusinessWalletAddress("");
    setUpdateSuccess(false);
    setUpdateError("");
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  function BusinessCard({ searchResult }) {
    return (
      <Card
        sx={{
          display: "flex",
          width: 400,
          minHeight: 250,
          flexDirection: "column",
          gap: 1,
          flexGrow: 1,
          p: 2,
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>Name:</Typography>
        <Typography>{searchResult.business_name}</Typography>

        <Typography sx={{ fontWeight: "bold" }}>ID:</Typography>
        <Typography>{searchResult.id}</Typography>

        <Typography sx={{ fontWeight: "bold" }}>Wallet:</Typography>
        <Typography sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
          {searchResult.wallet_address}
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
      {/* Search Section */}
      <Paper elevation={6} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>Business Registry</Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <FormControl>
              <TextField
                value={searchParam}
                onChange={(e) => setSearchParam(e.target.value)}
                label="Search for a business"
              />
            </FormControl>

            <Typography>by...</Typography>

            <FormControl>
              <Select
                sx={{ width: 120 }}
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="id">ID</MenuItem>
                <MenuItem value="wallet">Wallet</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={async () => {
                setLastSearch(searchParam);
                setSearchResult(await searchBusiness(searchParam, searchBy));
              }}
            >
              Search
            </Button>
          </Box>

          {searchResult && <BusinessCard searchResult={searchResult} />}

          {!searchResult && lastSearch && (
            <Typography>No results found for "{lastSearch}".</Typography>
          )}
        </Box>
      </Paper>

    {/* Register Business Section */}
    <Paper
    elevation={6}
    sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: registrationSuccess ? "#e8f5e9" : "background.paper",
        border: registrationSuccess ? "2px solid #4caf50" : "1px solid transparent",
        transition: "all 0.3s ease",
    }}
    >
    {registrationSuccess ? (
        <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 220,
            textAlign: "center",
        }}
        >
        <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "success.main" }}
        >
            Successfully added business
        </Typography>

        {selectedBusiness && (
            <Typography variant="body1" color="text.secondary">
            {selectedBusiness.business_name} has been registered.
            </Typography>
        )}

        <Button
            variant="contained"
            color="success"
            onClick={resetRegistrationForm}
            sx={{ mt: 1 }}
        >
            Add Another Business
        </Button>
        </Box>
    ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Register a business</Typography>

        {/* Register Error */}
        {registerError && (
            <Alert severity="error" onClose={() => setRegisterError("")}>
            {registerError}
            </Alert>
        )}

        <FormControl fullWidth>
            <Select
            displayEmpty
            value={selectedBusinessId}
            onChange={(e) => {
                console.log("selected business:", e.target.value);
                setSelectedBusinessId(e.target.value);
                setRegisterError("");
            }}
            renderValue={(selected) => {
                if (!selected) return <em>Choose a business</em>;

                const business = businesses.find((b) => b.id === selected);
                if (!business) return <em>Choose a business</em>;

                return `${business.business_name} (${business.id})`;
            }}
            >
            <MenuItem value="">
                <em>Choose a business</em>
            </MenuItem>

            {businesses.map((business) => (
                <MenuItem key={business.id} value={business.id}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontWeight: 600 }}>
                    {business.business_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    {business.business_type} • {business.city},{" "}
                    {business.state_province}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                    ID: {business.id}
                    </Typography>
                </Box>
                </MenuItem>
            ))}
            </Select>
        </FormControl>

        {selectedBusiness && (
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
                {selectedBusiness.business_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {selectedBusiness.business_type}
            </Typography>
            <Typography variant="body2">
                {selectedBusiness.street_address}, {selectedBusiness.city},{" "}
                {selectedBusiness.state_province} {selectedBusiness.postal_code}
            </Typography>
            <Typography variant="body2">
                {selectedBusiness.contact_email}
            </Typography>
            <Typography variant="body2">
                {selectedBusiness.phone_number}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Business ID: {selectedBusiness.id}
            </Typography>
            </Card>
        )}

        <TextField
            label="Wallet Address to Register"
            value={registrationWalletAddress}
            onChange={(e) => {
            setRegistrationWalletAddress(e.target.value);
            setRegisterError("");
            }}
            placeholder="0x..."
            fullWidth
        />

        <Button
            variant="contained"
            onClick={registerBusiness}
            disabled={!selectedBusiness || !registrationWalletAddress || isRegistering}
            sx={{ width: "fit-content" }}
        >
            {isRegistering ? "Registering..." : "Register"}
        </Button>
        </Box>
    )}
    </Paper>

      {/* Update Wallet Section */}
      <Paper
        elevation={6}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: updateSuccess ? "#e8f5e9" : "background.paper",
          border: updateSuccess ? "2px solid #4caf50" : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        {updateSuccess ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "success.main" }}
            >
              Wallet address updated successfully
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Business wallet address has been updated on-chain.
            </Typography>

            <Button
              variant="contained"
              color="success"
              onClick={resetUpdateForm}
              sx={{ mt: 1 }}
            >
              Update Another Wallet
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              Update business wallet address
            </Typography>

            {/* Update Error */}
            {updateError && (
              <Alert severity="error" onClose={() => setUpdateError("")}>
                {updateError}
              </Alert>
            )}

            <TextField
              label="Current Wallet Address"
              value={oldBusinessWalletAddress}
              onChange={(e) => setOldBusinessWalletAddress(e.target.value)}
            />

            <TextField
              label="New Wallet Address"
              value={newBusinessWalletAddress}
              onChange={(e) => {
                setNewBusinessWalletAddress(e.target.value);
                setUpdateError("");
              }}
            />

            <TextField
              label="Business Id"
              value={businessId}
              onChange={(e) => {
                setBusinessId(e.target.value);
                setUpdateError("");
              }}
            />

            <Button
              variant="contained"
              sx={{ width: "fit-content" }}
              onClick={updateWalletAddress}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update address"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default BusinessRegistry;