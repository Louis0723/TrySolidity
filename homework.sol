pragma solidity ^0.4.10;

contract jianfe {
    int8 public targetWeight = 0; //目標體重
    int8 public lastWeight = 0; //最後一次紀錄之體重
    uint256 public firstPen= 0; //發起人投資金
    uint256 public amount = 0; //總合
    address public initiator; //發起人
    uint256 public time = 0; //到期時間
    uint16 public goodsCount = 0; //看好人總數
    uint16 public badsCount = 0;  //看壞人總數
    uint256 public goodAmount = 0; //看好投資數
    uint256 public badAmount = 0; //看好投資數
    mapping (uint => address) public gooder; //看好人
    mapping (uint => address) public bader; //看壞人
    mapping (address => uint256) public goodProportion; //看好人權重
    mapping (address => uint256) public badProportion; //看壞人權重
    bool public lock = false; //結算鎖
    event act(address people,uint256 time); //動作事件
    event settleEvent(uint256 amount,uint256 time);//結算事件

    modifier timeout() { //檢查超時 如超時->結算
        act(msg.sender,now);
        if(now <= time * 1 seconds) {
        _;
        }else {
            this.settle();
        }
    }
    modifier toRaise() { //檢查是否結算 否->繼續累計
        if (lock != true) {
            amount += msg.value;
            _;
        }
    }
    function jianfe(address _initiator,int8 _targetWeight ,int8 _lastWeight ,uint _time) payable {
        initiator = _initiator;
        targetWeight = _targetWeight;
        lastWeight = _lastWeight;
        time = now + _time;
        firstPen = msg.value;
        amount = msg.value;
    }

    function good() timeout() toRaise() payable { //看好
        goodAmount += msg.value;
        if(goodProportion[msg.sender] > 0) {
            goodProportion[msg.sender] += msg.value;
        }
        else {
            gooder[goodCount] = msg.sender;
            goodCount += 1;
            goodProportion[msg.sender] = msg.value;
        }
    }

    function bad() timeout() toRaise() payable { //看壞
        badAmount += msg.value;
        if(badProportion[msg.sender] > 0) {
            badProportion[msg.sender] += msg.value;
        }
        else {
            bader[badCount] = msg.sender;
            badCount += 1;
            badProportion[msg.sender] = msg.value;
        }
    }

    function recordWeight(int8 _lastWeight) { //記錄體重
        lastWeight = _lastWeight;
        if (lastWeight <= targetWeight) {
            this.settle();
        }
    }
    
    function settle() external { //結算
        if(lock != true) {
            settleEvent(amount,now);
            if (lastWeight <= targetWeight) {
                uint256 halfAmount = ((amount-firstPen)/2);
                initiator.transfer(firstPen + halfAmount);
                for (uint256 goodIndex = 0; goodIndex < goodCount; goodIndex++) {
                    gooder[goodIndex].transfer( halfAmount*(goodProportion[gooder[goodIndex]]/goodAmount) );
                }
            }else {
                for (uint256 indexBad = 0; indexBad < badCount; indexBad++) {
                    bader[indexBad].transfer( amount*(badProportion[bader[indexBad]]/badAmount) );
                }
            }
            lock = true;
        }
    }
}

contract biyezhuanti {
    mapping (address => address) public contractMap;
    event newContract(address jianfeAddress ,uint256 money ,uint time);

    function createContract(int8 _targetWeight ,int8 _lastWeight ,uint _time) payable { //建立合約
        if( _targetWeight != 0 ) {
            contractMap[msg.sender] = (new jianfe).value( msg.value )(msg.sender ,_targetWeight , _lastWeight , _time ) ;
            newContract( contractMap[msg.sender] ,msg.value , _time);
        }
    }

    function deleteContract(address sender) { //刪除合約
        jianfe(contractMap[sender]).settle();
        delete contractMap[sender];
    }
}