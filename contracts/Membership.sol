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

import "./interface/IMembership.sol";
import "./interface/IAssets.sol";

import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Membership is
    Initializable,
    AccessControlEnumerableUpgradeable,
    IMembership
{
    mapping(uint256 => Unit) private ecosystems;
    mapping(string => bool) private ecosystemRegisteredNames;

    mapping(uint256 => Unit) private companies;
    mapping(uint256 => mapping(address => bool)) companyUsers;

    mapping(uint256 => mapping(uint256 => Unit)) private ecosystemBrainstems;
    mapping(uint256 => mapping(uint256 => Unit)) private ecosystemCompanies;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => Unit))) private ecosystemBrainstemsCompanies;
    mapping(uint256 => mapping(uint256 => uint256[])) private ecosystemCompaniesAssociatedBrainstems;

    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) private ecosystemBrainstemAssets;
    IAssets private assets;

    function initialize(
        address _admin,
        address _assets
    ) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        assets = IAssets(_assets);
    }

    function setAssetsContract(address _assets) external onlyRole(DEFAULT_ADMIN_ROLE) {
        assets = IAssets(_assets);
    }

    function createEcosystem(Unit calldata ecosystem) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystem.id != 0, "ecosystem id cannot be 0");
        require(ecosystemRegisteredNames[ecosystem.name] == false, "ecosystem name already registered");
        require(ecosystems[ecosystem.id].id == 0, "ecosystem id already registered");
        
        ecosystems[ecosystem.id] = ecosystem;
        ecosystemRegisteredNames[ecosystem.name] = true;
        emit EcosystemCreated(ecosystem.id, ecosystem);
    }

    function createCompany(Unit calldata company) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(company.id != 0, "company id cannot be 0");
        require(companies[company.id].id == 0, "company id already registered");
        
        companies[company.id] = company;
        emit CompanyCreated(company.id, company);
    }

    function createBrainstem(Unit calldata brainstem, uint256 ecosystemId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(brainstem.id != 0, "brainstem id cannot be 0");
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemBrainstems[ecosystemId][brainstem.id].id == 0, "brainstem id already registered in ecosystem");
        
        ecosystemBrainstems[ecosystemId][brainstem.id] = brainstem;
        emit BrainstemCreated(brainstem.id, brainstem, ecosystemId);
    }

    function addEcosystemCompany(uint256 ecosystemId, uint256 companyId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(companies[companyId].id != 0, "company id not found");
        require(ecosystemCompanies[ecosystemId][companyId].id == 0, "company already part of ecosystem");
        
        ecosystemCompanies[ecosystemId][companyId] = companies[companyId];
        emit EcosystemCompanyAdded(ecosystemId, companyId);
    }

    function removeEcosystemCompany(uint256 ecosystemId, uint256 companyId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(companies[companyId].id != 0, "company id not found");
        require(ecosystemCompanies[ecosystemId][companyId].id != 0, "company not part of ecosystem");
        require(ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId].length == 0, "company part of brainstem");

        delete ecosystemCompanies[ecosystemId][companyId];
        emit EcosystemCompanyRemoved(ecosystemId, companyId);
    }

    function addUsers(
        uint256 companyId,
        address[] calldata users
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < users.length; i++) {
            require(companies[companyId].id != 0, "company id not found");
            require(!companyUsers[companyId][users[i]], "user already part of company");
            companyUsers[companyId][users[i]] = true;

            emit UserAdded(companyId, users[i]);
        }
    }

    function removeUsers(
        uint256 companyId,
        address[] calldata users
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < users.length; i++) {
            require(companies[companyId].id != 0, "company id not found");
            require(companyUsers[companyId][users[i]], "user not part of company");
            delete companyUsers[companyId][users[i]];

            emit UserRemoved(companyId, users[i]);
        }
    }

    function addBrainstemCompany(uint256 ecosystemId, uint256 brainstemId, uint256 companyId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemBrainstems[ecosystemId][brainstemId].id != 0, "brainstem id not found");
        require(companies[companyId].id != 0, "company id not found");
        require(ecosystemCompanies[ecosystemId][companyId].id != 0, "company not part of ecosystem");
        require(ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId].length == 0, "company already part of brainstem");

        ecosystemBrainstemsCompanies[ecosystemId][brainstemId][companyId] = companies[companyId];
        ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId].push(brainstemId);

        emit BrainstemCompanyAdded(ecosystemId, brainstemId, companyId);
    }

    function removeBrainstemCompany(uint256 ecosystemId, uint256 brainstemId, uint256 companyId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemBrainstems[ecosystemId][brainstemId].id != 0, "brainstem id not found");
        require(companies[companyId].id != 0, "company id not found");
        require(ecosystemCompanies[ecosystemId][companyId].id != 0, "company not part of ecosystem");
        require(ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId].length != 0, "company not part of brainstem");

        removeBrainstemFromCompanyAssociatedBrainstems(ecosystemId, brainstemId, companyId);
        delete ecosystemBrainstemsCompanies[ecosystemId][brainstemId][companyId];

        emit BrainstemCompanyRemoved(ecosystemId, brainstemId, companyId);
    }

    function removeBrainstemFromCompanyAssociatedBrainstems(uint256 ecosystemId, uint256 brainstemId, uint256 companyId) internal {
        for (uint256 i = 0; i < ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId].length; i++) {
            if (ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId][i] == brainstemId) {
                ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId][i] = ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId][ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId].length - 1];
                ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId].pop();
                break;
            }
        }
    }

    function registerAsset(
        uint256 ecosystemId,
        uint256 brainstemId,
        uint256 companyId,
        uint256 assetId
    ) external override {
        require(assets.creatorOf(assetId) == msg.sender, "user not admin of asset");
        require(companyUsers[companyId][msg.sender], "user not part of the company");
        require(!ecosystemBrainstemAssets[ecosystemId][brainstemId][assetId], "asset already registered in brainstem");

        ecosystemBrainstemAssets[ecosystemId][brainstemId][assetId] = true;
        emit AssetRegistered(ecosystemId, brainstemId, assetId);
    }

    function getEcosystem(uint256 id) external view override returns (Unit memory) {
        return ecosystems[id];
    }

    function getCompany(uint256 id) external view override returns (Unit memory) {
        return companies[id];
    }

    function getBrainstem(uint256 ecosystemId, uint256 brainstemId) external view override returns (Unit memory) {
        return ecosystemBrainstems[ecosystemId][brainstemId];
    }

    function getCompanyAssociatedBrainstems(uint256 ecosystemId, uint256 companyId) external view override returns (uint256[] memory) {
        return ecosystemCompaniesAssociatedBrainstems[ecosystemId][companyId];
    }

    function userInCompany(uint256 companyId, address user) external view override returns (bool) {
        return companyUsers[companyId][user];
    }

    function companyInEcosystem(uint256 ecosystemId, uint256 companyId) external view override returns (bool) {
        return ecosystemCompanies[ecosystemId][companyId].id != 0;
    }

    function companyInBrainstem(uint256 ecosystemId, uint256 brainstemId, uint256 companyId) external view override returns (bool) {
        return ecosystemBrainstemsCompanies[ecosystemId][brainstemId][companyId].id != 0;
    }

    function assetInBrainstem(uint256 ecosystemId, uint256 brainstemId, uint256 assetId) external view override returns (bool) {
        return ecosystemBrainstemAssets[ecosystemId][brainstemId][assetId];
    }
}
