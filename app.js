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
    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(ethereumUri));
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
        if (loginCheck(req,res)) return
        let web3=getWeb3();
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
    app.get(/^\/recordWeight/),
    function(req, res) {
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