const ethereumUri = 'http://localhost:8545';
const richAccount="0x00a329c0648769A73afAc7F9381E08FB43dBEA72"
const richPassword=" "

let loginCheck=function(req,res){
    accountID=req.param("accountID")
    if(accountID===undefined){
        res.send('no input accountID');
    }
    return accountID===undefined ? true : false;
}
let getWeb3=function(){
    let Web3 = require("web3");
    Web3.prototype.getAccount=function(address,...password){
        if(password.length==0) password[0]=""
        this.personal.unlockAccount(address,password[0]);
        return address
    }
    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(ethereumUri));
    return web3;
}
module.exports=function(app){
    app.get(/^\/$/, function(req, res) {
        res.send('Hello World');
    })
    app.get(/^\/createAccount/, function(req, res) {
        let web3=getWeb3();
        let newAccount = web3.personal.newAccount()
        web3.personal.unlockAccount(richAccount, richPassword);
        web3.eth.sendTransaction({
            from: richAccount,
            to: newAccount,
            value: '100000000000000000000'
        })
        console.log(newAccount)
        res.send(newAccount);
    })
    app.get(/^\/createContract/, function(req, res) {
        if (loginCheck(req,res)) return;
        let web3=getWeb3();
        let biyezhuanti=web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contractMap","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_targetWeight","type":"int8"},{"name":"_lastWeight","type":"int8"},{"name":"_time","type":"uint256"}],"name":"createContract","outputs":[],"payable":true,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"jianfeAddress","type":"address"},{"indexed":false,"name":"money","type":"uint256"},{"indexed":false,"name":"time","type":"uint256"}],"name":"createContractEvent","type":"event"}],"0xDcbe17a8B781304e28623cc82A68794675548a09");
        let biyeContract=biyezhuanti.at("0xDcbe17a8B781304e28623cc82A68794675548a09");
        data=biyeContract.createContract.getData(50,60,3000);
        web3.eth.sendTransaction({to:"0xDcbe17a8B781304e28623cc82A68794675548a09",from:web3.getAccount("0x002915BdFBDf6C789aa654aaA22E6865D9111F6C"),data:data,value:50000000000000000000,gas:5999999})
        res.send('return contractID');
    })
    app.get(/^\/good/, function(req, res) {
        if (loginCheck(req,res)) return
        console.log("good")
        res.send('good');
    })
    app.get(/^\/bad/, function(req, res) {
        if (loginCheck(req,res)) return
        console.log("bad")
        res.send('bad');
    })
    app.get(/^\/recordWeight/),function(req, res) {
        if (loginCheck(req,res)) return
        console.log("recordWeight")
        res.send('recordWeight');
    }
    app.get(/^\/settle/, function(req, res) {
        if (loginCheck(req,res)) return
        console.log("settle")
        res.send('settle');
    })
}