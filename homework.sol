pragma solidity ^0.4.13;

contract jianfe {
    int8 public targetWeight = 0;
    int8 public lastWeight = 0;
    uint256 public amount = 0;
    address public initiator;
    uint256 public time = 0;
    uint16 public goodersCount = 1;
    uint16 public badersCount = 0;
    uint256 public goodAmount = 0;
    uint256 public badAmount = 0;
    mapping (uint => address) public gooder;
    mapping (uint => address) public bader;
    mapping (address => uint256) public goodProportion;
    mapping (address => uint256) public badProportion;
    event act(address people,uint256 time);
    event settleEvent(uint256 amount,uint256 time,string);

    modifier timeout() { 
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
    modifier toRaise() { 
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
        gooder[0] = initiator;
        goodProportion[initiator] = msg.value;

    }

    function good() timeout toRaise payable {
        goodAmount += msg.value;
        if(goodProportion[msg.sender] > 0) {
            goodProportion[msg.sender] += msg.value;
        }else {
            gooder[goodersCount] = msg.sender;
            goodersCount += 1;
            goodProportion[msg.sender] = msg.value;
        }
    }

    function bad() timeout toRaise payable { 
        badAmount += += msg.value;
        if(badProportion[msg.sender] > 0) {
            badProportion[msg.sender] += msg.value;
        }else {
            bader[badersCount] = msg.sender;
            badersCount += 1;
            badProportion[msg.sender] = msg.value;
        }
    }

    function recordWeight(int8 _lastWeight) timeout { 
        if(initiator == msg.sender) {
            lastWeight = _lastWeight;
            if (lastWeight <= targetWeight) {
                settle();
            }
        }
    }
    
    function settle() { 
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
    event newContract(address jianfeAddress ,uint256 money ,uint time);

    function createContract(int8 _targetWeight ,int8 _lastWeight ,uint _time) payable {
        if( _targetWeight != 0 &&  msg.value != 0) {
            contractMap[msg.sender] = (new jianfe).value( msg.value )(msg.sender ,_targetWeight , _lastWeight , _time ) ;
            newContract( contractMap[msg.sender] ,msg.value , _time);
        }
    }

    function deleteContract(address sender) {
        delete contractMap[sender];
    }
}