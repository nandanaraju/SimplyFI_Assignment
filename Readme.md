
# Hyperledger Fabric Assignment

## Setup Instructions

### 1. Prerequisites
Make sure you have the following tools installed:
- Docker
- Docker Compose
- Node.js
- Hyperledger Fabric binaries and Docker images

### 2. Clone the Repository
Clone the project repository to your local machine:
```bash
git clone git@github.com:nandanaraju/SimplyFI_Assignment.git
cd SimplyFI_Assignment
```

### 3. Navigate to the Network Folder
```bash
cd Network
```

### 4. Set Permissions for Script Files
Before running the scripts, set the correct permissions:
```bash
chmod +x registerEnroll.sh
chmod +x startNetwork.sh
chmod +x stopNetwork.sh
```

### 5. Start the Network
Run the `startNetwork.sh` script to automate the initialization and setup of the blockchain network:
```bash
./startNetwork.sh
```

## Chaincode Operations

### Set Environment Variables
Before interacting with the network, set the required environment variables for the Manufacturer organization:
```bash
export CHANNEL_NAME=agrichannel
export FABRIC_CFG_PATH=./peercfg
export CORE_PEER_LOCALMSPID=manufacturerMSP
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/manufacturer.agri.com/peers/peer0.manufacturer.agri.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/manufacturer.agri.com/users/Admin@manufacturer.agri.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/agri.com/orderers/orderer.agri.com/msp/tlscacerts/tlsca.agri.com-cert.pem
export manufacturer_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/manufacturer.agri.com/peers/peer0.manufacturer.agri.com/tls/ca.crt
export wholesaler_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/wholesaler.agri.com/peers/peer0.wholesaler.agri.com/tls/ca.crt
export distributer_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/distributer.agri.com/peers/peer0.distributer.agri.com/tls/ca.crt

```

### a. Create a Product (Store data)
Submit a product's data using the following invoke command:
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.agri.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n Supply-chain --peerAddresses localhost:7051 --tlsRootCertFiles $manufacturer_PEER_TLSROOTCERT --peerAddresses localhost:9051 --tlsRootCertFiles $wholesaler_PEER_TLSROOTCERT --peerAddresses localhost:8051 --tlsRootCertFiles $distributer_PEER_TLSROOTCERT  -c '{"function":"createProduct","Args":["Product-01", "Paddy", "10","12/10/2024","Kerala", "Manufacturer1"]}'

```

### b. Read a Product (Retrieve data)
Query a product's data using the following command:
```bash
peer chaincode query -C $CHANNEL_NAME -n Supply-chain -c '{"function":"readProduct","Args":["Product-01"]}'```

```
### c. Update a Product (Modify data)

Now Update a product's details using the following invoke command:
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.agri.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n Supply-chain --peerAddresses localhost:7051 --tlsRootCertFiles $manufacturer_PEER_TLSROOTCERT --peerAddresses localhost:9051 --tlsRootCertFiles $wholesaler_PEER_TLSROOTCERT --peerAddresses localhost:8051 --tlsRootCertFiles $distributer_PEER_TLSROOTCERT  -c '{"function":"transferToWholesaler","Args":["Product-01", "Wholesaler1"]}'
```

### d. Get History of a Product (GetHistory)
Retrieve the history of a drug's data using the following query command:
```bash
peer chaincode query -C $CHANNEL_NAME -n Supply-chain -c '{"Args":["ProductContract:getProductHistory","Product-1”]}'
```

### e. Query by Non-Primary Key(GetHistoryByStatus)
Fetch all entries with a specific status using the following query command:
```bash
peer chaincode query -C $CHANNEL_NAME -n Supply-chain -c '{"function":"queryProductByStatus","Args":["Transferred to Wholesaler"]}'
```
