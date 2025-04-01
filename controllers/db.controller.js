require('dotenv').config()
const mongo = require('mongoose');
const crypto = require('crypto');
const { Schema } = mongo;
const {fetchStocks} = require('./fetch')

//connect to db
const connectDB = async ()=>{
    try{
        await mongo.connect(process.env.MONGO_URI);
    }catch(e){
        console.log(e)
    }
}

//create a schema for stockInfo

const stockSchema = new Schema({
    stock: {type: String, required: true},
    price: Number,
    likes: {type:Number, default:0},
    liked_by: {type:[String], default:[]},
})

const stockLogs = mongo.model('stockLogs', stockSchema);

//async function to insertStocks individually
async function insertStock(stock) {
    let stockName = String(stock).toUpperCase();

    try { 
        // Fetch stock price
        let stockData;
        try {
            stockData = await fetchStocks(stockName);
        } catch (e) {
            console.log("Error fetching stock price:", e);
            return; // Stop if fetching fails
        }

        let stockPrice = stockData?.latestPrice;
        if (stockPrice === undefined) {
            console.log(`Could not retrieve price for ${stockName}, unknown symbol [INSERT_STOCK]`);
            return;
        }

        // Check if stock exists
        let check = await stockLogs.findOne({ stock: stockName });

        if (!check) {
            await stockLogs.insertOne({ stock: stockName, price: stockPrice });
            return
        }
    } catch (e) {
        console.log("Error inserting stock:", e);
    }
}

//async function to insert an array of stocks into (insertStock)
async function insertMultiple(stockArr) {
    if (Array.isArray(stockArr)){
        await Promise.all(stockArr.map(stock=>{
            insertStock(stock)
        }))
    }else{
        console.error('Provided Parameter is not an Array.');
        return;
    }
    
}
//check function to update stock prices
async function updatePrice(stock) {
    let stockName = String(stock).toUpperCase();
    try{
        let stockData;
        try {
            stockData = await fetchStocks(stockName);
        } catch (e) {
            console.log("Error fetching stock price:", e);
            return; // Stop if fetching fails
        }

        let stockPrice = stockData?.latestPrice;
        if (stockPrice === undefined) {
            console.log(`Could not retrieve price for ${stockName} [UPDATE_PRICE]`);
            return;
        }

        await stockLogs.findOneAndUpdate({stock: stockName}, {$set: {price: stockPrice}});
        return

    }catch(e){
        return e
    }
    
}
//helper async function to make price updates to an array of stocks:
async function checkPricesandUpdate(stocks) {
    if(Array.isArray(stocks)){
        try{
            await Promise.all(stocks.map(stock=> updatePrice(stock)));
        }catch(e){
            return e
        }
        
    }else{
        console.log("provided Param is not an array, cannot bulk update");
    }
    
}

//check if ipaddr liked stock, if not, add the like and append ipaddr to the list of ipaddr that liked stock.
async function addLike(stock, ipadddr) {
    try{
        let hashedIp = crypto.createHash('sha256').update(ipadddr).digest('hex');
        let updatedLike = await stockLogs.findOneAndUpdate({stock: stock, liked_by: {$nin: [hashedIp]}}, {$inc: {likes: 1}, $addToSet: {liked_by: hashedIp}}, {upsert: false, new: true});
        return;
    
    }catch(e){
        console.log(e)
    }
}

async function addMultipleLikes(stocks, ipadddr) {
    if(!Array.isArray(stocks)) return console.log('Provided Stocks argument is not an array')
    try{
        await Promise.all(stocks.map(stock => addLike(stock, ipadddr)));
    }catch(e){
        return e
    }
}


async function getStockInfo(stock) {
    let stockName = String(stock).toUpperCase();
    try{
        const stockInfo = await stockLogs.findOne({stock: stockName});
        return stockInfo;
    }catch(e){
        return null;
    }
}

async function getMultipleStockInfo(stocks) {
    if(Array.isArray(stocks)){
        try{
            return await Promise.all(stocks.map(stock=>getStockInfo(stock)));
        }catch(e){
            return e;
        }
    }else{
        return console.log('not array')
    }
}

module.exports = {connectDB, insertStock, insertMultiple, checkPricesandUpdate, updatePrice, addLike, addMultipleLikes, getStockInfo, getMultipleStockInfo };