import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { orderFactoryAddress } from "../GovernmentABI/orderFactoryAddress";
import { orderFactoryABI } from "../GovernmentABI/orderFactoryABI";
import { businessRegistryAddress } from "../GovernmentABI/businessRegistryAddress";
import { businessRegistryABI } from "../GovernmentABI/businessRegistryABI";

const ACCESS_MODES = {
  PUBLIC: "public",
  GOVERNMENT: "government",
};

const READ_ONLY_RPC_URL = "http://127.0.0.1:8545";

const createEmptyItem = () => ({
  name: "",
  quantity: "",
  price: "",
});

function ContractsPage() {
  const [accessMode, setAccessMode] = useState(ACCESS_MODES.PUBLIC);
  const [contracts, setContracts] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [factoryAdmin, setFactoryAdmin] = useState("");
  const [networkLabel, setNetworkLabel] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createStatus, setCreateStatus] = useState("");
  const [formState, setFormState] = useState({
    businessWallet: "",
    items: [createEmptyItem()],
  });

  useEffect(() => {
    loadBusinesses();
    loadContracts();
  }, []);

  const selectedBusiness = useMemo(
    () =>
      businesses.find(
        (business) => business.wallet_address === formState.businessWallet
      ) || null,
    [businesses, formState.businessWallet]
  );

  const getReadProvider = () => new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);

  const getWalletProvider = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is required for government actions.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    return provider;
  };

  const formatNetwork = (network) =>
    `${network.name} (chainId: ${network.chainId.toString()})`;

  const formatPrice = (value) => {
    const number = Number(value);
    if (Number.isNaN(number)) {
      return value;
    }

    return number.toLocaleString();
  };

  const loadBusinesses = async () => {
    setBusinessesLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/businesses");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setPageError("Unable to load businesses from the backend.");
    } finally {
      setBusinessesLoading(false);
    }
  };

  const loadContracts = async () => {
    setContractsLoading(true);
    setPageError("");

    try {
      const provider = getReadProvider();
      const network = await provider.getNetwork();
      const factory = new ethers.Contract(
        orderFactoryAddress,
        orderFactoryABI,
        provider
      );
      const admin = await factory.admin();
      const addresses = await factory.getAllOrders();

      setFactoryAdmin(admin);
      setNetworkLabel(formatNetwork(network));

      const contractDetails = await Promise.all(
        addresses.map(async (address, index) => {
          const details = await factory.getOrderDetail(address);

          return {
            id: `${index}-${address}`,
            address,
            businessAddress: details[0],
            itemNames: details[1],
            itemPrices: details[2].map((price) => price.toString()),
            itemQuantities: details[3],
            paymentStatus: details[4],
            fulfillmentStatus: details[5],
          };
        })
      );

      setContracts(contractDetails);
    } catch (error) {
      console.error("Failed to load contracts:", error);
      setContracts([]);
      setPageError(
        "Unable to load contracts. Start Hardhat and deploy the contracts first."
      );
    } finally {
      setContractsLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateItem = (index, field, value) => {
    setFormState((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setFormState((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()],
    }));
  };

  const removeItem = (index) => {
    setFormState((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const createContract = async () => {
    if (!selectedBusiness) {
      setCreateStatus("Choose a business before creating a contract.");
      return;
    }

    const cleanedItems = formState.items
      .map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity.trim(),
        price: item.price,
      }))
      .filter(
        (item) => item.name.length > 0 || item.quantity.length > 0 || item.price !== ""
      );

    if (cleanedItems.length === 0) {
      setCreateStatus("Add at least one contract item.");
      return;
    }

    const invalidItem = cleanedItems.find(
      (item) =>
        item.name.length === 0 ||
        item.quantity.length === 0 ||
        Number(item.price) <= 0 ||
        Number.isNaN(Number(item.price))
    );

    if (invalidItem) {
      setCreateStatus(
        "Every item needs a name, quantity, and positive numeric price."
      );
      return;
    }

    setCreateBusy(true);
    setCreateStatus("Creating contract on chain...");

    try {
      const provider = await getWalletProvider();
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const factory = new ethers.Contract(
        orderFactoryAddress,
        orderFactoryABI,
        signer
      );
      const registry = new ethers.Contract(
        businessRegistryAddress,
        businessRegistryABI,
        signer
      );
      const adminAddress = await factory.admin();

      if (signerAddress.toLowerCase() !== adminAddress.toLowerCase()) {
        throw new Error(
          "The connected wallet is not the government admin for this deployment."
        );
      }

      const exists = await registry.businessExists(selectedBusiness.business_name);
      if (!exists) {
        const registerTx = await registry.registerBusiness(
          selectedBusiness.wallet_address,
          selectedBusiness.business_name,
          String(selectedBusiness.registration_number)
        );
        await registerTx.wait();
      }

      const createTx = await factory.createOrderContract(
        selectedBusiness.wallet_address,
        cleanedItems.map((item) => item.name),
        cleanedItems.map((item) => Number(item.price)),
        cleanedItems.map((item) => item.quantity)
      );
      await createTx.wait();

      setCreateStatus("Contract created and assigned successfully.");
      setFormState({
        businessWallet: "",
        items: [createEmptyItem()],
      });
      await loadContracts();
    } catch (error) {
      console.error("Failed to create contract:", error);
      setCreateStatus(error.reason || error.message);
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">Contracts</Typography>
          <Typography variant="body1" color="text.secondary">
            Public mode is read-only. Government mode can assign new contracts,
            and this toggle is ready to be replaced by login-driven role state later.
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={accessMode === ACCESS_MODES.GOVERNMENT}
              onChange={(event) =>
                setAccessMode(
                  event.target.checked
                    ? ACCESS_MODES.GOVERNMENT
                    : ACCESS_MODES.PUBLIC
                )
              }
            />
          }
          label={
            accessMode === ACCESS_MODES.GOVERNMENT
              ? "Government mode"
              : "Public mode"
          }
        />
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Read Access</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Both modes can view deployed contracts, item details, and assigned businesses.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Network: {networkLabel || "Not connected"}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Factory</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Address: {orderFactoryAddress}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Admin: {factoryAdmin || "Not loaded yet"}
          </Typography>
          <Button sx={{ mt: 2 }} variant="outlined" onClick={loadContracts}>
            Refresh Contracts
          </Button>
        </Paper>
      </Stack>

      {accessMode === ACCESS_MODES.GOVERNMENT && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5">Create Contract</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Government users can create a contract and assign it to a registered business.
          </Typography>

          <TextField
            select
            fullWidth
            label="Assign to business"
            value={formState.businessWallet}
            onChange={(event) => updateForm("businessWallet", event.target.value)}
            sx={{ mt: 3 }}
            helperText={
              businessesLoading
                ? "Loading businesses..."
                : "Businesses are loaded from the backend database."
            }
          >
            {businesses.map((business) => (
              <MenuItem key={business.id} value={business.wallet_address}>
                {business.business_name} ({business.wallet_address})
              </MenuItem>
            ))}
          </TextField>

          {selectedBusiness && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1">Selected business</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Registration #: {selectedBusiness.registration_number}
              </Typography>
              <Typography variant="body2">
                Type: {selectedBusiness.business_type}
              </Typography>
              <Typography variant="body2">
                Email: {selectedBusiness.contact_email}
              </Typography>
            </Paper>
          )}

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Contract items
          </Typography>

          <Stack spacing={2}>
            {formState.items.map((item, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label={`Item ${index + 1} name`}
                    value={item.name}
                    onChange={(event) =>
                      updateItem(index, "name", event.target.value)
                    }
                  />
                  <TextField
                    fullWidth
                    label="Quantity"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, "quantity", event.target.value)
                    }
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Price"
                    value={item.price}
                    onChange={(event) =>
                      updateItem(index, "price", event.target.value)
                    }
                  />
                  <Box>
                    <Button
                      color="error"
                      disabled={formState.items.length === 1}
                      onClick={() => removeItem(index)}
                    >
                      Remove Item
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={addItem}>
              Add Item
            </Button>
            <Button
              variant="contained"
              disabled={createBusy}
              onClick={createContract}
            >
              {createBusy ? "Creating..." : "Create Contract"}
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ mt: 2 }}>
            {createStatus || "Connect the admin wallet before creating a contract."}
          </Typography>
        </Paper>
      )}

      {pageError && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography color="error">{pageError}</Typography>
        </Paper>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>
        All Contracts
      </Typography>

      {contractsLoading ? (
        <Paper sx={{ p: 2 }}>
          <Typography>Loading contracts...</Typography>
        </Paper>
      ) : contracts.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography>No contracts found yet.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {contracts.map((contract, index) => {
            const business = businesses.find(
              (entry) =>
                entry.wallet_address?.toLowerCase() ===
                contract.businessAddress.toLowerCase()
            );

            return (
              <Paper key={contract.id} sx={{ p: 3 }}>
                <Typography variant="h6">Contract #{index + 1}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Contract address: {contract.address}
                </Typography>
                <Typography variant="body2">
                  Assigned wallet: {contract.businessAddress}
                </Typography>
                <Typography variant="body2">
                  Business: {business?.business_name || "Not found in backend DB"}
                </Typography>
                <Typography variant="body2">
                  Payment status: {contract.paymentStatus ? "Paid" : "Unpaid"}
                </Typography>
                <Typography variant="body2">
                  Fulfillment status:{" "}
                  {contract.fulfillmentStatus ? "Fulfilled" : "Pending"}
                </Typography>

                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Line items
                </Typography>
                <List dense>
                  {contract.itemNames.map((name, itemIndex) => (
                    <ListItem key={`${contract.address}-${itemIndex}`}>
                      <ListItemText
                        primary={name}
                        secondary={`Qty: ${contract.itemQuantities[itemIndex]} | Price: ${formatPrice(
                          contract.itemPrices[itemIndex]
                        )}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export default ContractsPage;
