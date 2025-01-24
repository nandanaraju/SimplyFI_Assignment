
# SimplyFi A

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
git clone https://github.com/akshaj-22/SimplyFI-Assignment.git
cd SimplyFI-Assignment
```

### 3. Navigate to the Network Folder
```bash
cd PharmaNetwork
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
export CHANNEL_NAME=pharmachannel
export FABRIC_CFG_PATH=./peercfg
export CORE_PEER_LOCALMSPID=manufacturerMSP
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/manufacturer.pharma.com/peers/peer0.manufacturer.pharma.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/manufacturer.pharma.com/users/Admin@manufacturer.pharma.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem
export DVA_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/DVA.pharma.com/peers/peer0.DVA.pharma.com/tls/ca.crt
export manufacturer_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/manufacturer.pharma.com/peers/peer0.manufacturer.pharma.com/tls/ca.crt
export distributor_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/distributor.pharma.com/peers/peer0.distributor.pharma.com/tls/ca.crt
export hospital_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/hospital.pharma.com/peers/peer0.hospital.pharma.com/tls/ca.crt

```

### A. Store Drug Data(Create Drug)
Submit a drug's data using the following invoke command:
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n PharmaChaincode --peerAddresses localhost:5051 --tlsRootCertFiles $DVA_PEER_TLSROOTCERT --peerAddresses localhost:7051 --tlsRootCertFiles $manufacturer_PEER_TLSROOTCERT --peerAddresses localhost:9051 --tlsRootCertFiles $distributor_PEER_TLSROOTCERT --peerAddresses localhost:6051 --tlsRootCertFiles $hospital_PEER_TLSROOTCERT -c '{"function":"createDrug","Args":["Drug-01", "Drug1", "Brand1", "Bayer", "2023-01-01", "2025-01-01"]}'

```

### b. Retrieve Drug Data(Read Drug)
Query a drug's data using the following command:
```bash
peer chaincode query -C $CHANNEL_NAME -n PharmaChaincode -c '{"function":"readDrug","Args":["Drug-01"]}'
```

### c. Update Drug Data(Approve Drug)
Change the environment variable to update the drug details using the following command 
```bash
export CHANNEL_NAME=pharmachannel
export FABRIC_CFG_PATH=./peercfg
export CORE_PEER_LOCALMSPID=DVAMSP
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/DVA.pharma.com/peers/peer0.DVA.pharma.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/DVA.pharma.com/users/Admin@DVA.pharma.com/msp
export CORE_PEER_ADDRESS=localhost:6051
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem
export DVA_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/DVA.pharma.com/peers/peer0.DVA.pharma.com/tls/ca.crt
export manufacturer_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/manufacturer.pharma.com/peers/peer0.manufacturer.pharma.com/tls/ca.crt
export distributor_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/distributor.pharma.com/peers/peer0.distributor.pharma.com/tls/ca.crt
```

Now Update a drug's details using the following invoke command:
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n PharmaChaincode --peerAddresses localhost:5051 --tlsRootCertFiles $DVA_PEER_TLSROOTCERT --peerAddresses localhost:7051 --tlsRootCertFiles $manufacturer_PEER_TLSROOTCERT --peerAddresses localhost:9051 --tlsRootCertFiles $distributor_PEER_TLSROOTCERT --peerAddresses localhost:6051 --tlsRootCertFiles $hospital_PEER_TLSROOTCERT -c '{"function":"approveDrug","Args":["Drug-01"]}'
```

### d. Get History of a Drug(GetHistory)
Retrieve the history of a drug's data using the following query command:
```bash
peer chaincode query -C $CHANNEL_NAME -n PharmaChaincode -c '{"function":"getHistory","Args":["Drug-01"]}'
```

### e. Query by Non-Primary Key(GetHistoryByStatus)
Fetch all entries with a specific status using the following query command:
```bash
peer chaincode query -C $CHANNEL_NAME -n PharmaChaincode -c '{"function":"queryDrugsByStatus","Args":["Assigned to distributor"]}'
```
