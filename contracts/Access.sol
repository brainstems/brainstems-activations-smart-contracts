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

import "./interface/IAccess.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

contract Access is 
    IAccess,
    Initializable,
    AccessControlEnumerableUpgradeable
{
    mapping (uint256 => mapping(uint256 => mapping(uint256 => AccessType))) private _ecosystemAssetBrainstemAccess;

    function initialize(
        address _admin
    ) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function _updateEcosystemBrainstemAccess(uint256 assetId, uint256 ecosystem, uint256 brainstem, AccessType access) private {
        _ecosystemAssetBrainstemAccess[ecosystem][assetId][brainstem] = access;
    }

    function updateEcosystemBrainstemAccess(uint256 assetId, uint256 ecosystem, uint256 brainstem, AccessType access) external onlyRole(DEFAULT_ADMIN_ROLE) override {
        _updateEcosystemBrainstemAccess(assetId, ecosystem, brainstem, access);
    }

    function getEcosystemBrainstemAccess(uint256 assetId, uint256 ecosystem, uint256 brainstem) external view override returns (AccessType) {
        return _ecosystemAssetBrainstemAccess[ecosystem][assetId][brainstem];
    }
}
