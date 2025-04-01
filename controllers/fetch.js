async function fetchStocks(stocks) {
    
    if (Array.isArray(stocks)){
        const urls = [`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[0]}/quote`,
        `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks[1]}/quote`]
        try{
            const [res1, res2] = await Promise.all(urls.map(url=>fetch(url)));
            const [data1, data2] = await Promise.all([res1.json(), res2.json()])
            return { stock1: data1, stock2: data2 };
        }catch(e){
            console.log(e);

        }

    }else{
        
        try{
            const res = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stocks}/quote`);
            const data = await res.json();
            if(data.symbol == undefined){
                console.error('Unknown Symbol FETCHSTOCKS FUNCTION ERR Exiting..');
                return;
            }
            return data;
        }catch(e){
            console.log(e);
        }
    }    
}


module.exports = {fetchStocks};