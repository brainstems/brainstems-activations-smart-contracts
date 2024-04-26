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
import "./interface/IAccess.sol";
import "./interface/IMembership.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

contract Execution is 
  Initializable,
  IExecution,
  AccessControlEnumerableUpgradeable
{
    mapping(uint256 => mapping(uint256 => Execution)) private assetBrainstemExecutions;
    mapping(uint256 => uint256) private assetBrainstemExecutionId;

    IAccess private _access;
    IMembership private _membership;

    function initialize(
        address _admin
    ) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    // TODO:
    // - Allow updating the access control contract.
    // - Allow updating the membership contract.

    function useBrainstemAsset(uint256 assetId, uint256 ecosystemId, uint256 brainstemId, uint256 companyId, bytes memory data) external override {
      require(_membership.userInCompany(companyId, msg.sender), "Execution: User is not part of the company.");
      require(_membership.companyInBrainstem(ecosystemId, brainstemId, companyId), "Execution: Company is not part of brainstem.");

      AccessType hasAccess = _access.getEcosystemBrainstemAccess(assetId, ecosystemId, brainstemId);
      require(hasAccess == AccessType.USAGE, "Execution: Brainstem does not have access to the asset.");

      Execution memory execution = Execution({
        id: assetBrainstemExecutionId[assetId],
        assetId: assetId,
        ecosystemId: ecosystemId,
        brainstemId: brainstemId,
        companyId: companyId,
        executor: msg.sender,
        data: data
      });

      assetBrainstemExecutions[assetId][assetBrainstemExecutionId[assetId]] = execution;
      assetBrainstemExecutionId[assetId] += 1;

      emit AssetUsed(assetId, ecosystemId, brainstemId, companyId, msg.sender, execution.id, data);
    }

    function queryBrainstemAssetUse(uint256 assetId, uint256 executionId) external view override returns (Execution memory) {
      return assetBrainstemExecutions[assetId][executionId];
    }
}
