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
    mapping (uint256 => mapping(uint256 => mapping(uint256 => AccessType))) private _ecosystemAssetPathwayAccess;

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

    function _updateEcosystemPathwayAccess(uint256 assetId, uint256 ecosystem, uint256 pathway, AccessType access) private {
        require(_assets.assetExists(assetId), "Access: Asset does not exist");
        require(_membership.getEcosystem(ecosystem).id != 0, "Access: Ecosystem does not exist");
        require(_membership.getPathway(ecosystem, pathway).id != 0, "Access: Pathway does not exist in ecosystem");

        _ecosystemAssetPathwayAccess[ecosystem][assetId][pathway] = access;
        emit EcosystemPathwayAccessUpdated(assetId, ecosystem, pathway, access);
    }

    function updateEcosystemPathwayAccess(uint256 assetId, uint256 ecosystem, uint256 pathway, AccessType access) external onlyRole(DEFAULT_ADMIN_ROLE) override {
        _updateEcosystemPathwayAccess(assetId, ecosystem, pathway, access);
    }

    function updateEcosystemPathwayAccessBatch(uint256[] memory assetIds, uint256[] memory ecosystems, uint256[] memory pathways, AccessType[] memory accesses) external onlyRole(DEFAULT_ADMIN_ROLE) override {
        require(assetIds.length == ecosystems.length && ecosystems.length == pathways.length && pathways.length == accesses.length, "Access: Invalid input length");
        for (uint256 i = 0; i < assetIds.length; i++) {
            _updateEcosystemPathwayAccess(assetIds[i], ecosystems[i], pathways[i], accesses[i]);
        }
    }

    function getEcosystemPathwayAccess(uint256 assetId, uint256 ecosystem, uint256 pathway) external view override returns (AccessType) {
        return _ecosystemAssetPathwayAccess[ecosystem][assetId][pathway];
    }
}
