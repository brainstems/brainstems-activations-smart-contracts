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
    mapping(uint256 => mapping(uint256 => Execution)) private assetPathwayExecutions;
    mapping(uint256 => uint256) private assetPathwayExecutionId;

    IAccess private _access;
    IMembership private _membership;

    function initialize(
        address _admin,
        address access,
        address membership
    ) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _access = IAccess(access);
        _membership = IMembership(membership);
    }

    function setAccessContract(address access) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _access = IAccess(access);
    }

    function setMembershipContract(address membership) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _membership = IMembership(membership);
    }

    function usePathwayAsset(uint256 assetId, uint256 ecosystemId, uint256 pathwayId, uint256 neuronId, bytes memory data) external override {
      require(_membership.userInNeuron(neuronId, msg.sender), "Execution: User is not part of the neuron.");
      require(_membership.neuronInPathway(ecosystemId, pathwayId, neuronId), "Execution: Neuron is not part of pathway.");

      AccessType hasAccess = _access.getEcosystemPathwayAccess(assetId, ecosystemId, pathwayId);
      require(hasAccess == AccessType.USAGE, "Execution: Pathway does not have access to the asset.");

      Execution memory execution = Execution({
        id: assetPathwayExecutionId[assetId],
        assetId: assetId,
        ecosystemId: ecosystemId,
        pathwayId: pathwayId,
        neuronId: neuronId,
        executor: msg.sender,
        data: data
      });

      assetPathwayExecutions[assetId][assetPathwayExecutionId[assetId]] = execution;
      assetPathwayExecutionId[assetId] += 1;

      emit AssetUsed(assetId, ecosystemId, pathwayId, neuronId, msg.sender, execution.id, data);
    }

    function queryPathwayAssetUse(uint256 assetId, uint256 executionId) external view override returns (Execution memory) {
      return assetPathwayExecutions[assetId][executionId];
    }
}
