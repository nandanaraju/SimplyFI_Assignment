'use strict';

const { Contract } = require('fabric-contract-api');
const OrderContract = require('./order-contract'); 

class ProductContract extends Contract {

    // Check if a product exists
    async productExists(ctx, productId) {
        const buffer = await ctx.stub.getState(productId);
        return (!!buffer && buffer.length > 0);
    }

    // Manufacturer creates a product
    async createProduct(ctx, productId, type, quantity, harvestDate, origin, producerName) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'manufacturerMSP') {
            const exists = await this.productExists(ctx, productId);
            if (exists) {
                throw new Error(`The product ${productId} already exists`);
            }
            const product = {
                type,
                quantity,
                harvestDate,
                origin,
                status: 'Harvested',
                ownedBy: producerName,
                assetType: 'product'
            };
            const buffer = Buffer.from(JSON.stringify(product));
            await ctx.stub.putState(productId, buffer);

            const productEvent = { Type: 'Product creation', ProductType: type };
            await ctx.stub.setEvent('addProductEvent', Buffer.from(JSON.stringify(productEvent)));
        } else {
            return `User under the following MSP: ${mspID} cannot perform this action`;
        }
    }

    // Read product details by productId
    async readProduct(ctx, productId) {
        const exists = await this.productExists(ctx, productId);
        if (!exists) {
            throw new Error(`The product ${productId} does not exist`);
        }
        const buffer = await ctx.stub.getState(productId);
        return JSON.parse(buffer.toString());
    }

    // Manufacturer deletes a product
    async deleteProduct(ctx, productId) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'manufacturerMSP') {
            const exists = await this.productExists(ctx, productId);
            if (!exists) {
                throw new Error(`The product ${productId} does not exist`);
            }
            await ctx.stub.deleteState(productId);
        } else {
            return `User under the following MSP: ${mspID} cannot perform this action`;
        }
    }

    // manufacturer updates the product status to "Transferred to Wholesaler"
    async transferToWholesaler(ctx, productId, wholesalerName) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'manufacturerMSP') {
            const exists = await this.productExists(ctx, productId);
            if (!exists) {
                throw new Error(`The product ${productId} does not exist`);
            }
            const buffer = await ctx.stub.getState(productId);
            const product = JSON.parse(buffer.toString());
            product.status = 'Transferred to Wholesaler';
            product.ownedBy = wholesalerName;

            const updatedProductBuffer = Buffer.from(JSON.stringify(product));
            await ctx.stub.putState(productId, updatedProductBuffer);
        } else {
            return `User under the following MSP: ${mspID} cannot perform this action`;
        }
    }

    // Distributer creates an order, then matches it with available products
    async matchOrder(ctx, productId, orderId) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID !== 'wholesalerMSP') {
            return `Organization with MSP ID ${mspID} cannot perform this action.`;
        }

        const productExists = await this.productExists(ctx, productId);
        if (!productExists) {
            throw new Error(`The product ${productId} does not exist`);
        }

        // Check if the product status is 'Transferred to Wholesaler'
        const productDetails = await this.readProduct(ctx, productId);
        if (productDetails.status !== 'Transferred to Wholesaler') {
            throw new Error(`Product ${productId} must be 'Transferred to Wholesaler' before matching an order.`);
        }

        const orderContract = new OrderContract();
        const orderExists = await orderContract.orderExists(ctx, orderId);
        if (!orderExists) {
            throw new Error(`The order ${orderId} does not exist`);
        }

        const orderDetails = await orderContract.readOrder(ctx, orderId);

        // Matching criteria based on product type and quantity
        if (orderDetails.type === productDetails.type && orderDetails.quantity <= productDetails.quantity) {
            productDetails.ownedBy = orderDetails.distributerName;
            productDetails.status = 'Assigned to Order';

           

            console.log("product details ===",productDetails)
            const updatedProductBufferNew = Buffer.from(JSON.stringify(productDetails));
            await ctx.stub.putState(productId, updatedProductBufferNew);

            await orderContract.deleteOrder(ctx, orderId); // Delete the matched order from OrderContract
            return `Product ${productId} is assigned to ${orderDetails.distributerName}`;
        } else {
            return 'Order does not match the product specifications';
        }
    }
    

    async assignProductToMarket(ctx, productId, ownerName, marketName) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'distributerMSP') {
            const exists = await this.productExists(ctx, productId);
            if (!exists) {
                throw new Error(`The product ${productId} does not exist`);
            }

            const productBuffer = await ctx.stub.getState(productId);
            const productDetails = JSON.parse(productBuffer.toString());

            

            productDetails.status = `Assigned to ${ownerName} for the market ${marketName}`;
            productDetails.ownedBy = ownerName;

            const newProductBuffer = Buffer.from(JSON.stringify(productDetails));
            await ctx.stub.putState(productId, newProductBuffer);

            return `Product ${productId} is successfully assigned to ${ownerName}`;
        } else {
            return `User under following MSP:${mspID} cannot able to perform this action`;
        }
    }

    async queryProductByStatus(ctx, status) {
        const queryString = {
            selector: {
                status: status
            }
        };
        const products = await this._getQueryResult(ctx, JSON.stringify(queryString));
        return JSON.stringify(products);
    }

    async _getQueryResult(ctx, queryString) {
        const iterator = await ctx.stub.getQueryResult(queryString);
        const results = [];
        let res = await iterator.next();
    
        while (!res.done) {
            const result = res.value.value.toString('utf8');
            results.push(JSON.parse(result));
            res = await iterator.next();
        }
    
        await iterator.close();
        return results;
    }

    async queryAllProducts(ctx) {
        const queryString = {
            selector: {
                assetType: 'product',
                
            }
        };

        let resultIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        let result = await this._getAllResults(resultIterator);
        return JSON.stringify(result)

    }
    async getProductsByRange(ctx, startKey, endKey) {
        let resultIterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = await this._getAllResults(resultIterator);
        return JSON.stringify(result)
    }
    //underscore specifies its an internal function.it is used inside the function
    async getProductHistory(ctx, productId) {
        let resultIterator = await ctx.stub.getHistoryForKey(productId)
        let result = await this._getAllResults(resultIterator, true);
        return JSON.stringify(result)
    }

    async _getAllResults(iterator, isHistory) {
        let allResult = [];

        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.txId
                    jsonRes.Timestamp = res.value.timestamp
                    jsonRes.Record = JSON.parse(res.value.value.toString())
                }
                else {
                    jsonRes.Key = res.value.key;
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                }
                allResult.push(jsonRes)
            }
            res = await iterator.next()
        }
        await iterator.close()
        return allResult
    }

}

module.exports = ProductContract;
