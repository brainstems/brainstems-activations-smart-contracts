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
import "./interface/IAssets.sol";
import "./interface/IMembership.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

contract Access is 
    IAccess,
    Initializable,
    AccessControlEnumerableUpgradeable
{
    mapping (uint256 => mapping(uint256 => mapping(uint256 => AccessType))) private _brainstemAssetPathwayAccess;

    IAssets private _assets;
    IMembership private _membership;

    function initialize(
        address _admin,
        address assets,
        address membership
    ) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _assets = IAssets(assets);
        _membership = IMembership(membership);
    }

    function setAssetsContract(address assets) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _assets = IAssets(assets);
    }

    function setMembershipContract(address membership) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _membership = IMembership(membership);
    }

    function _updateBrainstemPathwayAccess(uint256 assetId, uint256 brainstem, uint256 pathway, AccessType access) private {
        require(_assets.assetExists(assetId), "Access: Asset does not exist");
        require(_membership.getBrainstem(brainstem).id != 0, "Access: Brainstem does not exist");
        require(_membership.getPathway(brainstem, pathway).id != 0, "Access: Pathway does not exist in brainstem");

        _brainstemAssetPathwayAccess[brainstem][assetId][pathway] = access;
        emit BrainstemPathwayAccessUpdated(assetId, brainstem, pathway, access);
    }

    function updateBrainstemPathwayAccess(uint256 assetId, uint256 brainstem, uint256 pathway, AccessType access) external onlyRole(DEFAULT_ADMIN_ROLE) override {
        _updateBrainstemPathwayAccess(assetId, brainstem, pathway, access);
    }

    function updateBrainstemPathwayAccessBatch(uint256[] memory assetIds, uint256[] memory brainstems, uint256[] memory pathways, AccessType[] memory accesses) external onlyRole(DEFAULT_ADMIN_ROLE) override {
        require(assetIds.length == brainstems.length && brainstems.length == pathways.length && pathways.length == accesses.length, "Access: Invalid input length");
        for (uint256 i = 0; i < assetIds.length; i++) {
            _updateBrainstemPathwayAccess(assetIds[i], brainstems[i], pathways[i], accesses[i]);
        }
    }

    function getBrainstemPathwayAccess(uint256 assetId, uint256 brainstem, uint256 pathway) external view override returns (AccessType) {
        return _brainstemAssetPathwayAccess[brainstem][assetId][pathway];
    }
}
