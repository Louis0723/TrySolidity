let BigNumber=require("bignumber.js")
const ethereumUri = 'http://localhost:8545';
const biyezhuantyAddress="0xC3dE6b8B00dA66F6db5413AC0e44772a1B184Deb";
const biyezhuantyABI=[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contractMap","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_targetWeight","type":"int8"},{"name":"_lastWeight","type":"int8"},{"name":"_time","type":"uint256"}],"name":"createContract","outputs":[],"payable":true,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_jianfeAddress","type":"address"},{"indexed":false,"name":"_money","type":"uint256"},{"indexed":false,"name":"_time","type":"uint256"}],"name":"createContractEvent","type":"event"}];
const jianfeABI=[{"constant":true,"inputs":[],"name":"goodersCount","outputs":[{"name":"","type":"uint16"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"settle","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"time","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"badAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"badProportion","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"goodProportion","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"initiator","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_lastWeight","type":"int8"}],"name":"recordWeight","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"gooder","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"bad","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"amount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"good","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"lastWeight","outputs":[{"name":"","type":"int8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"goodAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"targetWeight","outputs":[{"name":"","type":"int8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bader","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"badersCount","outputs":[{"name":"","type":"uint16"}],"payable":false,"type":"function"},{"inputs":[{"name":"_initiator","type":"address"},{"name":"_targetWeight","type":"int8"},{"name":"_lastWeight","type":"int8"},{"name":"_time","type":"uint256"}],"payable":true,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_people","type":"address"},{"indexed":false,"name":"_time","type":"uint256"}],"name":"act","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_amount","type":"uint256"},{"indexed":false,"name":"_time","type":"uint256"},{"indexed":false,"name":"_result","type":"string"}],"name":"settleEvent","type":"event"}]
const richAccount="0x00a329c0648769A73afAc7F9381E08FB43dBEA72"
const richPassword=" "
const zero18="000000000000000000"

let contractMap={};

let loginCheck=function(req,res){
    let accountID=req.param("accountID")
    if(accountID===undefined){
        res.send('no input accountID');
    }
    return accountID===undefined ? true : false;
}

let getWeb3=function(){
    let Web3 = require("web3");
    Web3.prototype.getAccount=function(address,...password){
        if(password.length==0) password[0]="";
        this.personal.unlockAccount(address,password[0]);
        return address;
    }
    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(ethereumUri));
    return web3;
}

module.exports=function(app){
    app.get(/^\/$/, function(req, res) {
        res.send(JSON.stringify(contractMap));
    })
    app.get(/^\/balance/, function(req, res) {
        let accountID=req.param("accountID");
        if(accountID===undefined){
            res.send('no input accountID');
            return;
        }
        let web3=getWeb3();
        res.send( web3.eth.getBalance(accountID) );
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

        console.log(newAccount);
        res.send(newAccount);
    })
    app.get(/^\/createContract/, function(req, res) {
        if (loginCheck(req,res)) return;
        let accountID=req.param("accountID");
        let money=req.param("money");
        let targetWeight=req.param("targetWeight");
        let lastWeight=req.param("lastWeight");
        let time=req.param("time");
        if(accountID===undefined || money===undefined || targetWeight===undefined || lastWeight===undefined|| time===undefined){
            res.send('no input accountID or money or targetWeight or lastWeight or time');
            return;
        }
        money+=zero18;
        time=parseInt(time)*86400

        let web3=getWeb3();
        let biyezhuanti=web3.eth.contract(biyezhuantyABI);
        let biyeContract=biyezhuanti.at(biyezhuantyAddress);
        event=biyeContract.createContractEvent();
        event.watch(function(error,result){
            let jianfe=web3.eth.contract(jianfeABI)
            let jianfeContract=jianfe.at(result.args._jianfeAddress)
            contractMap[accountID]=jianfeContract;
            try{
                res.send( JSON.stringify(
                    {
                        jianfeAddress:result.args._jianfeAddress,
                        money:result.args._money,
                        time:result.args._time
                    }
                )) 
            }
            catch(e){}
        })

        data=biyeContract.createContract.getData(parseInt(targetWeight),parseInt(lastWeight),time);
        web3.eth.sendTransaction({to:biyezhuantyAddress,from:web3.getAccount(accountID),data:data,value:money,gas:5999999})
        
    })
    app.get(/^\/good/, function(req, res) {
        if (loginCheck(req,res)) return;
        let accountID=req.param("accountID");
        let contractFrom=req.param("contractFrom");
        let money=req.param("money");
        if(accountID===undefined || money===undefined || contractFrom===undefined){
            res.send('no input accountID or money or contractFrom');
            return;
        }
        money+=zero18;

        let web3=getWeb3();
        data=contractMap[contractFrom].good.getData()
        web3.eth.sendTransaction({to:contractMap[contractFrom].address,from:web3.getAccount(accountID),data:data,value:money,gas:5999999})
        console.log("good");
        res.send('good');
    })
    app.get(/^\/bad/, function(req, res) {
        if (loginCheck(req,res)) return;
        let accountID=req.param("accountID");
        let contractFrom=req.param("contractFrom");
        let money=req.param("money");
        if(accountID===undefined || money===undefined || contractFrom===undefined){
            res.send('no input accountID or money or contractFrom');
            return;
        }
        money+=zero18;

        let web3=getWeb3();
        data=contractMap[contractFrom].bad.getData()
        web3.eth.sendTransaction({to:contractMap[contractFrom].address,from:web3.getAccount(accountID),data:data,value:money,gas:5999999})
        console.log("bad");
        res.send('bad');
    })
    app.get(/^\/recordWeight/),function(req, res) {
        if (loginCheck(req,res)) return;
        let accountID=req.param("accountID");
        let weight=req.param("weight");
        if(accountID===undefined || weight===undefined ){
            res.send('no input accountID or weight');
            return;
        }

        let web3=getWeb3();
        data=contractMap[contractFrom].recordWeight.getData(parseInt(weight))
        web3.eth.sendTransaction({to:contractMap[contractFrom].address,from:web3.getAccount(accountID),data:data,gas:5999999})
        console.log("recordWeight");
        res.send('recordWeight');
    }
    app.get(/^\/settle/, function(req, res) {
        if (loginCheck(req,res)) return
        let account=req.param("accountID");
        let contractFrom=req.param("contractFrom");
        if(accountID===undefined || contractFrom===undefined ){
            res.send('no input accountID or contractFrom');
            return;
        }


        let web3=getWeb3();
        data=contractMap[contractFrom].settle.getData()
        web3.eth.sendTransaction({to:contractMap[contractFrom].address,from:web3.getAccount(accountID),data:data,gas:5999999})
        delete contractMap[contractFrom];
        console.log("settle");
        res.send('settle');
    })
}