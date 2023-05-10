// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract ERC20 is IERC20, Initializable {

    string public symbol;
    string public name;
    uint8 public decimals;
    address public owner;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowed;
    uint256 private TotalSupply;

    function init(
        string memory _symbol,
        string memory _name,
        uint256 _totalSupply
    ) external initializer {
        symbol = _symbol;
        name = _name;
        decimals = 18;
        owner = msg.sender;
        TotalSupply = _totalSupply;
        balances[msg.sender] = TotalSupply;
        emit Transfer(address(0), msg.sender, TotalSupply);
    }

    function totalSupply() external view returns (uint256) {
        return TotalSupply;
    }

    function balanceOf(address _owner) external view returns (uint256) {
        return balances[_owner];
    }

    function allowance(address _owner, address _spender)
        external
        view
        returns (uint256)
    {
        return allowed[_owner][_spender];
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_value <= balances[msg.sender], "not enough token");
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        require(_value <= balances[msg.sender], "not enough token");
        allowed[msg.sender][_spender] = _value;
        emit Approval(_spender, msg.sender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        require(
            allowed[_from][msg.sender] >= _value,
            "not enough token at owner"
        );
        allowed[_from][msg.sender] = allowed[_from][msg.sender] - _value;
        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function transferOwner(address _owner) external {
        require(msg.sender == owner, "not owner");
        owner = _owner;
    }
}
