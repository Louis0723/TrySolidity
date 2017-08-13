pragma solidity ^0.4.15;

contract jianfe {
    int8 public targetWeight = 0; //目標體重
    int8 public lastWeight = 0; //最後一次記錄體重
    uint256 public amount = 0; //累計總額
    address public initiator; //發起人
    uint256 public time = 0; //到期時間
    uint16 public goodersCount = 1; //看好人數
    uint16 public badersCount = 0; //看壞人數
    uint256 public goodAmount = 0; //看好總數
    uint256 public badAmount = 0; //看壞總數
    mapping (uint => address) public gooder; //看好人
    mapping (uint => address) public bader; //看壞人
    mapping (address => uint256) public goodProportion; //看好個人總數
    mapping (address => uint256) public badProportion; //看壞個人總數
    event act(address _people,uint256 _time); //動作事件
    event settleEvent(uint256 _amount,uint256 _time,string _result); //結算事件

    modifier timeout() { //判斷是否超時 => 結算
        act(msg.sender,now);
        if(now <= time * 1 seconds) {
        _;
        }else {
            if(msg.value > 0) {
                msg.sender.transfer(msg.value);
            }
            settle();
        }
    }
    modifier toRaise() { //判斷是否為發起人=>否則累計總額
        if(msg.sender != initiator) {
            amount += msg.value;
            _;
        }
    }
    function jianfe(address _initiator,int8 _targetWeight ,int8 _lastWeight ,uint _time) payable {
        initiator = _initiator;
        targetWeight = _targetWeight;
        lastWeight = _lastWeight;
        time = now + _time;

        amount = msg.value;
        goodAmount = msg.value;
        gooder[0] = initiator;
        goodProportion[initiator] = msg.value;

    }

    function good() timeout toRaise payable { //看好
        goodAmount += msg.value;
        if(goodProportion[msg.sender] > 0) {
            goodProportion[msg.sender] += msg.value;
        }else {
            gooder[goodersCount] = msg.sender;
            goodersCount += 1;
            goodProportion[msg.sender] = msg.value;
        }
    }

    function bad() timeout toRaise payable { //看壞
        badAmount += msg.value;
        if(badProportion[msg.sender] > 0) {
            badProportion[msg.sender] += msg.value;
        }else {
            bader[badersCount] = msg.sender;
            badersCount += 1;
            badProportion[msg.sender] = msg.value;
        }
    }

    function recordWeight(int8 _lastWeight) timeout { //記錄體重
        if(initiator == msg.sender) {
            lastWeight = _lastWeight;
            if (lastWeight <= targetWeight) {
                settle();
            }
        }
    }
    
    function settle() { //結算
        if(now >= time * 1 seconds || initiator == msg.sender) {
            if (lastWeight <= targetWeight || badAmount == 0) {
                settleEvent(amount,now, "good");
                for (uint256 goodIndex = 0; goodIndex < goodersCount; goodIndex++ ) {
                    gooder[ goodIndex ].transfer( amount * goodProportion[ gooder[ goodIndex ] ] / goodAmount );
                }
            }else {
                settleEvent(amount,now, "bad");
                for (uint256 badIndex = 0; badIndex < badersCount; badIndex++ ) {
                    bader[ badIndex ].transfer( amount * badProportion[ bader[ badIndex ] ] / badAmount );
                }
            }
            selfdestruct(initiator);
        }
    }
}

contract biyezhuanti {
    mapping (address => address) public contractMap;
    event createContractEvent(address _jianfeAddress ,uint256 _money ,uint _time);

    function createContract(int8 _targetWeight ,int8 _lastWeight ,uint _time) payable { //建立合約
        if( _targetWeight != 0 &&  msg.value != 0) {
            contractMap[msg.sender] = (new jianfe).value( msg.value )(msg.sender ,_targetWeight , _lastWeight , _time ) ;
            createContractEvent( contractMap[msg.sender] ,msg.value , _time);
        }
    }
}