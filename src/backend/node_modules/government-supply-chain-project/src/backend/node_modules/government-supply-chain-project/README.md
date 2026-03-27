
# Blockchain-Based Supply Chain Provenance System Project Read Me

The aim of this project is to create a blockchain based system that utilizes smart contracts to track public spending on public procurement from the start of the contract until the final payment is completed.  Government transparency is fundamental to an informed democracy. The relationship between the government and those who supply it with goods and services is often murky and vulnerable to corruption. The application will be accessed through a frontend using React.js. All information for the smart contracts and transactions will be stored on the blockchain and can be accessed by all stakeholders. Government entities will register businesses in the system, by coordinating with them to register an associated wallet address for their business.  These will be tied to existing off-chain business identification methods using a relational database that our frontend can access.







## Architecture

The chosen platform will be Ethereum blockchain with a tech stack of Hardhat, MetaMask, Ether.js, and React.js. Three main stakeholders exist in this project, the government, businesses and the public. Contracts will be organized in a Smart contract Factory. Contracts can be created by the government and read by the public. Contractors/Vendors can register wallets to a database and be assigned contracts via the government.


![Screenshot](./Screenshots/Architecture.png)

## Dependencies
 
## Dependencies

| Package     | Version             |
|------------|-------------------|
| Node.js    | v18+               |
| React      | 19.x               |
| Ethers     | v6.x               |
| Dotenv     | latest             |
| Hardhat    | 2.x                |
| Express    | 4.x (backend)      |
| MySQL2     | 3.x (backend)      |
| Nodemon    | 3.x (backend dev)  |
| Concurrently | 9.x (root dev)   |

## Run directions
## Scripts & Run Directions

From the **root folder**, you can run:

```bash
# Install all dependencies for frontend and backend
npm run install-all

# Start both backend and frontend concurrently
npm run start-all

# Full dev workflow (install + start)
npm run dev

# Quick dev (start without reinstalling dependencies)
npm run quick-dev

# Deploy smart contracts to local blockchain
npm run deploy

# Start backend only
cd src/backend
npm run dev

# Start frontend only
cd src/frontend
npm start
```

## Authors

- [@griseldacarl](https://www.github.com/griseldacarl)
- [@craig653](https://www.github.com/craig653)
- [@mpeter56](https://www.github.com/mpeter56)

