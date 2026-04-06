import React from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';

// abi imports
import { businessRegistryAddress } from '../GovernmentABI/businessRegistryAddress';
import { businessRegistryABI } from '../GovernmentABI/businessRegistryABI';

// mui imports
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';


function BusinessRegistry() {
    // Use to make admin functions greyed out
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <Box>
            <Typography>Search for a business</Typography>
            <Typography>Register a business</Typography>
            <Typography>Update business wallet address</Typography>
        </Box>
    )
}

export default BusinessRegistry;
