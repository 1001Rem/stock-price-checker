const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let initalLikes1;
    test('Viewing one stock: GET request to /api/stock-prices/', (done)=>{
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/')
        .query({stock: 'GOOG'})
        .end((req, res)=>{
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.property(res.body.stockData, 'price' );
            assert.property(res.body.stockData, 'likes');
            assert.isString(res.body.stockData.stock);
            assert.isNumber(res.body.stockData.price);
            done();
        })
    });

    test('Viewing 1 stock and liking it: GET request to /api/stock-prices/', (done)=>{
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/')
        .query({stock: 'GOOG', like: 'true'})
        .end((req, res)=>{
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.property(res.body.stockData, 'price' );
            assert.property(res.body.stockData, 'likes');
            assert.isNumber(res.body.stockData.likes);
            assert.isString(res.body.stockData.stock);
            assert.isNumber(res.body.stockData.price);
            initalLikes1 = res.body.stockData.likes
            done();
        })
    });

    test('Viewing 1 stock and liking it AGAIN: GET request to /api/stock-prices/', (done)=>{
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/')
        .query({stock: 'GOOG', like: 'true'})
        .end((req, res)=>{
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.property(res.body.stockData, 'price' );
            assert.property(res.body.stockData, 'likes');
            assert.isNumber(res.body.stockData.likes);
            assert.equal(res.body.stockData.likes, initalLikes1);
            assert.isString(res.body.stockData.stock);
            assert.isNumber(res.body.stockData.price);
            done();
        })
    });

    test('Viewing 2 stocks: GET request to /api/stock-prices/', (done)=>{
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/')
        .query({stock: ['GOOG', 'MSFT']})
        .end((req, res)=>{
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.property(res.body.stockData[0], 'price' );
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.property(res.body.stockData[1], 'price' );
            assert.property(res.body.stockData[1], 'rel_likes');
            assert.isNumber(res.body.stockData[0].rel_likes);
            assert.isNumber(res.body.stockData[1].rel_likes);
            assert.isString(res.body.stockData[1].stock);
            assert.isNumber(res.body.stockData[0].price);
            assert.isString(res.body.stockData[0].stock);
            assert.isNumber(res.body.stockData[1].price);
            done();
        })
    });

    test('Viewing 2 stocks and liking them: GET request to /api/stock-prices/', (done)=>{
        chai
        .request(server)
        .keepOpen()
        .get('/api/stock-prices/')
        .query({stock: ['GOOG', 'MSFT'], like: 'true'})
        .end((req, res)=>{
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.property(res.body.stockData[0], 'price' );
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.property(res.body.stockData[1], 'price' );
            assert.property(res.body.stockData[1], 'rel_likes');
            assert.isNumber(res.body.stockData[0].rel_likes);
            assert.isNumber(res.body.stockData[1].rel_likes);
            assert.isString(res.body.stockData[1].stock);
            assert.isNumber(res.body.stockData[0].price);
            assert.isString(res.body.stockData[0].stock);
            assert.isNumber(res.body.stockData[1].price);
            assert.equal(res.body.stockData[0].rel_likes, 0)
            assert.equal(res.body.stockData[1].rel_likes, 0)
            done();
        })
    });



});
