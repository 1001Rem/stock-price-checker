'use strict';
const { insertStock, insertMultiple, checkPricesandUpdate, updatePrice, addLike, addMultipleLikes, getStockInfo, getMultipleStockInfo } = require('../controllers/db.controller');

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      let { stock, like } = req.query;
      let ipaddr = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
      if (like == undefined){
        like = false;
      }

      try {
        //parse bool values from querys correctly.
        const isLike = Boolean(like) && like.toLowerCase() === 'true';


        //if multiple stocks in query try to insert all of them
        if (Array.isArray(stock)) {
          // Handling multiple stocks
          await insertMultiple(stock);
          
          //if like bool val is present, like both stocks
          if (isLike) {
            await addMultipleLikes(stock, ipaddr);
          }
          
          //update prices
          await checkPricesandUpdate(stock);

          let [stockInfo1, stockInfo2] = await getMultipleStockInfo(stock);
          res.json({"stockData":[{"stock": stockInfo1?.stock, "price": stockInfo1?.price, "rel_likes": stockInfo1?.likes - stockInfo2?.likes}, 
            {"stock": stockInfo2?.stock, "price": stockInfo2?.price, "rel_likes": stockInfo2?.likes - stockInfo1?.likes}]
          });
          return;

        } else {
          // Handling a single stock
          await insertStock(stock);
          
          if (isLike) {
            await addLike(stock, ipaddr);
          }
          
          await updatePrice(stock);
          let stockInfo = await getStockInfo(stock);
          res.json({"stockData":{"stock":stockInfo?.stock,"price":stockInfo?.price,"likes":stockInfo?.likes}});
          return;
        }
      } catch (e) {
        console.error("Error processing request:", e);
        res.status(500).json({ error: 'An error occurred while processing the stock request.' });
      }


    });
};
