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
    mapping(uint256 => mapping(address => bool)) neuronUsers;

    mapping(uint256 => mapping(uint256 => Unit)) private ecosystemPathways;
    mapping(uint256 => mapping(uint256 => Unit)) private ecosystemCompanies;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => Unit))) private ecosystemPathwaysCompanies;
    mapping(uint256 => mapping(uint256 => uint256[])) private ecosystemCompaniesAssociatedPathways;

    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) private ecosystemPathwayAssets;
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

    function createNeuron(Unit calldata neuron) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(neuron.id != 0, "neuron id cannot be 0");
        require(companies[neuron.id].id == 0, "neuron id already registered");
        
        companies[neuron.id] = neuron;
        emit NeuronCreated(neuron.id, neuron);
    }

    function createPathway(Unit calldata pathway, uint256 ecosystemId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(pathway.id != 0, "pathway id cannot be 0");
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemPathways[ecosystemId][pathway.id].id == 0, "pathway id already registered in ecosystem");
        
        ecosystemPathways[ecosystemId][pathway.id] = pathway;
        emit PathwayCreated(pathway.id, pathway, ecosystemId);
    }

    function addEcosystemNeuron(uint256 ecosystemId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(ecosystemCompanies[ecosystemId][neuronId].id == 0, "neuron already part of ecosystem");
        
        ecosystemCompanies[ecosystemId][neuronId] = companies[neuronId];
        emit EcosystemNeuronAdded(ecosystemId, neuronId);
    }

    function removeEcosystemNeuron(uint256 ecosystemId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(ecosystemCompanies[ecosystemId][neuronId].id != 0, "neuron not part of ecosystem");
        require(ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId].length == 0, "neuron part of pathway");

        delete ecosystemCompanies[ecosystemId][neuronId];
        emit EcosystemNeuronRemoved(ecosystemId, neuronId);
    }

    function addUsers(
        uint256 neuronId,
        address[] calldata users
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < users.length; i++) {
            require(companies[neuronId].id != 0, "neuron id not found");
            require(!neuronUsers[neuronId][users[i]], "user already part of neuron");
            neuronUsers[neuronId][users[i]] = true;

            emit UserAdded(neuronId, users[i]);
        }
    }

    function removeUsers(
        uint256 neuronId,
        address[] calldata users
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < users.length; i++) {
            require(companies[neuronId].id != 0, "neuron id not found");
            require(neuronUsers[neuronId][users[i]], "user not part of neuron");
            delete neuronUsers[neuronId][users[i]];

            emit UserRemoved(neuronId, users[i]);
        }
    }

    function addPathwayNeuron(uint256 ecosystemId, uint256 pathwayId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemPathways[ecosystemId][pathwayId].id != 0, "pathway id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(ecosystemCompanies[ecosystemId][neuronId].id != 0, "neuron not part of ecosystem");
        require(ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId].length == 0, "neuron already part of pathway");

        ecosystemPathwaysCompanies[ecosystemId][pathwayId][neuronId] = companies[neuronId];
        ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId].push(pathwayId);

        emit PathwayNeuronAdded(ecosystemId, pathwayId, neuronId);
    }

    function removePathwayNeuron(uint256 ecosystemId, uint256 pathwayId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemPathways[ecosystemId][pathwayId].id != 0, "pathway id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(ecosystemCompanies[ecosystemId][neuronId].id != 0, "neuron not part of ecosystem");
        require(ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId].length != 0, "neuron not part of pathway");

        removePathwayFromNeuronAssociatedPathways(ecosystemId, pathwayId, neuronId);
        delete ecosystemPathwaysCompanies[ecosystemId][pathwayId][neuronId];

        emit PathwayNeuronRemoved(ecosystemId, pathwayId, neuronId);
    }

    function removePathwayFromNeuronAssociatedPathways(uint256 ecosystemId, uint256 pathwayId, uint256 neuronId) internal {
        for (uint256 i = 0; i < ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId].length; i++) {
            if (ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId][i] == pathwayId) {
                ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId][i] = ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId][ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId].length - 1];
                ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId].pop();
                break;
            }
        }
    }

    function registerAsset(
        uint256 ecosystemId,
        uint256 pathwayId,
        uint256 neuronId,
        uint256 assetId
    ) external override {
        require(assets.creatorOf(assetId) == msg.sender, "user not admin of asset");
        require(neuronUsers[neuronId][msg.sender], "user not part of the neuron");
        require(!ecosystemPathwayAssets[ecosystemId][pathwayId][assetId], "asset already registered in pathway");

        ecosystemPathwayAssets[ecosystemId][pathwayId][assetId] = true;
        emit AssetRegistered(ecosystemId, pathwayId, assetId);
    }

    function getEcosystem(uint256 id) external view override returns (Unit memory) {
        return ecosystems[id];
    }

    function getNeuron(uint256 id) external view override returns (Unit memory) {
        return companies[id];
    }

    function getPathway(uint256 ecosystemId, uint256 pathwayId) external view override returns (Unit memory) {
        return ecosystemPathways[ecosystemId][pathwayId];
    }

    function getNeuronAssociatedPathways(uint256 ecosystemId, uint256 neuronId) external view override returns (uint256[] memory) {
        return ecosystemCompaniesAssociatedPathways[ecosystemId][neuronId];
    }

    function userInNeuron(uint256 neuronId, address user) external view override returns (bool) {
        return neuronUsers[neuronId][user];
    }

    function neuronInEcosystem(uint256 ecosystemId, uint256 neuronId) external view override returns (bool) {
        return ecosystemCompanies[ecosystemId][neuronId].id != 0;
    }

    function neuronInPathway(uint256 ecosystemId, uint256 pathwayId, uint256 neuronId) external view override returns (bool) {
        return ecosystemPathwaysCompanies[ecosystemId][pathwayId][neuronId].id != 0;
    }

    function assetInPathway(uint256 ecosystemId, uint256 pathwayId, uint256 assetId) external view override returns (bool) {
        return ecosystemPathwayAssets[ecosystemId][pathwayId][assetId];
    }
}
