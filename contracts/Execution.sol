// SPDX-License-Identifier: MIT

/*
$$$$$$$\  $$$$$$$\   $$$$$$\  $$$$$$\ $$\   $$\  $$$$$$\ $$$$$$$$\ $$$$$$$$\ $$\      $$\  $$$$$$\  
$$  __$$\ $$  __$$\ $$  __$$\ \_$$  _|$$$\  $$ |$$  __$$\\__$$  __|$$  _____|$$$\    $$$ |$$  __$$\ 
$$ |  $$ |$$ |  $$ |$$ /  $$ |  $$ |  $$$$\ $$ |$$ /  \__|  $$ |   $$ |      $$$$\  $$$$ |$$ /  \__|
$$$$$$$\ |$$$$$$$  |$$$$$$$$ |  $$ |  $$ $$\$$ |\$$$$$$\    $$ |   $$$$$\    $$\$$\$$ $$ |\$$$$$$\  
$$  __$$\ $$  __$$< $$  __$$ |  $$ |  $$ \$$$$ | \____$$\   $$ |   $$  __|   $$ \$$$  $$ | \____$$\ 
$$ |  $$ |$$ |  $$ |$$ |  $$ |  $$ |  $$ |\$$$ |$$\   $$ |  $$ |   $$ |      $$ |\$  /$$ |$$\   $$ |
$$$$$$$  |$$ |  $$ |$$ |  $$ |$$$$$$\ $$ | \$$ |\$$$$$$  |  $$ |   $$$$$$$$\ $$ | \_/ $$ |\$$$$$$  |
\_______/ \__|  \__|\__|  \__|\______|\__|  \__| \______/   \__|   \________|\__|     \__| \______/ 
*/

pragma solidity ^0.8.7;

import "./interface/IExecution.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Execution is Initializable, IExecution {
    mapping(uint256 => mapping(uint256 => Execution)) private assetExecutions;
    mapping(uint256 => uint256) private assetExecutionId;

    function initialize() public initializer {}

    function useAsset(uint256 assetId, uint256 ecosystemId, uint256 brainstemId, uint256 companyId, bytes memory data) external override {
      // TODO: Check if asset exists.

      // TODO: Check access for the asset and the user.

      Execution memory execution = Execution({
        id: assetExecutionId[assetId],
        assetId: assetId,
        ecosystemId: ecosystemId,
        brainstemId: brainstemId,
        companyId: companyId,
        executor: msg.sender,
        data: data
      });

      assetExecutions[assetId][assetExecutionId[assetId]] = execution;
      assetExecutionId[assetId] += 1;

      emit AssetUsed(assetId, ecosystemId, brainstemId, companyId, msg.sender, execution.id, data);
    }

    function queryAssetUse(uint256 assetId, uint256 executionId) external view override returns (Execution memory) {
      return assetExecutions[assetId][executionId];
    }
}
