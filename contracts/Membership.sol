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
    mapping(uint256 => Unit) private brainstems;
    mapping(string => bool) private brainstemRegisteredNames;

    mapping(uint256 => Unit) private companies;
    mapping(uint256 => mapping(address => bool)) neuronUsers;

    mapping(uint256 => mapping(uint256 => Unit)) private brainstemPathways;
    mapping(uint256 => mapping(uint256 => Unit)) private brainstemCompanies;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => Unit))) private brainstemPathwaysCompanies;
    mapping(uint256 => mapping(uint256 => uint256[])) private brainstemCompaniesAssociatedPathways;

    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) private brainstemPathwayAssets;
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

    function createBrainstem(Unit calldata brainstem) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(brainstem.id != 0, "brainstem id cannot be 0");
        require(brainstemRegisteredNames[brainstem.name] == false, "brainstem name already registered");
        require(brainstems[brainstem.id].id == 0, "brainstem id already registered");
        
        brainstems[brainstem.id] = brainstem;
        brainstemRegisteredNames[brainstem.name] = true;
        emit BrainstemCreated(brainstem.id, brainstem);
    }

    function createNeuron(Unit calldata neuron) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(neuron.id != 0, "neuron id cannot be 0");
        require(companies[neuron.id].id == 0, "neuron id already registered");
        
        companies[neuron.id] = neuron;
        emit NeuronCreated(neuron.id, neuron);
    }

    function createPathway(Unit calldata pathway, uint256 brainstemId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(pathway.id != 0, "pathway id cannot be 0");
        require(brainstems[brainstemId].id != 0, "brainstem id not found");
        require(brainstemPathways[brainstemId][pathway.id].id == 0, "pathway id already registered in brainstem");
        
        brainstemPathways[brainstemId][pathway.id] = pathway;
        emit PathwayCreated(pathway.id, pathway, brainstemId);
    }

    function addBrainstemNeuron(uint256 brainstemId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(brainstems[brainstemId].id != 0, "brainstem id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(brainstemCompanies[brainstemId][neuronId].id == 0, "neuron already part of brainstem");
        
        brainstemCompanies[brainstemId][neuronId] = companies[neuronId];
        emit BrainstemNeuronAdded(brainstemId, neuronId);
    }

    function removeBrainstemNeuron(uint256 brainstemId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(brainstems[brainstemId].id != 0, "brainstem id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(brainstemCompanies[brainstemId][neuronId].id != 0, "neuron not part of brainstem");
        require(brainstemCompaniesAssociatedPathways[brainstemId][neuronId].length == 0, "neuron part of pathway");

        delete brainstemCompanies[brainstemId][neuronId];
        emit BrainstemNeuronRemoved(brainstemId, neuronId);
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

    function addPathwayNeuron(uint256 brainstemId, uint256 pathwayId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(brainstems[brainstemId].id != 0, "brainstem id not found");
        require(brainstemPathways[brainstemId][pathwayId].id != 0, "pathway id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(brainstemCompanies[brainstemId][neuronId].id != 0, "neuron not part of brainstem");
        require(brainstemCompaniesAssociatedPathways[brainstemId][neuronId].length == 0, "neuron already part of pathway");

        brainstemPathwaysCompanies[brainstemId][pathwayId][neuronId] = companies[neuronId];
        brainstemCompaniesAssociatedPathways[brainstemId][neuronId].push(pathwayId);

        emit PathwayNeuronAdded(brainstemId, pathwayId, neuronId);
    }

    function removePathwayNeuron(uint256 brainstemId, uint256 pathwayId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(brainstems[brainstemId].id != 0, "brainstem id not found");
        require(brainstemPathways[brainstemId][pathwayId].id != 0, "pathway id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(brainstemCompanies[brainstemId][neuronId].id != 0, "neuron not part of brainstem");
        require(brainstemCompaniesAssociatedPathways[brainstemId][neuronId].length != 0, "neuron not part of pathway");

        removePathwayFromNeuronAssociatedPathways(brainstemId, pathwayId, neuronId);
        delete brainstemPathwaysCompanies[brainstemId][pathwayId][neuronId];

        emit PathwayNeuronRemoved(brainstemId, pathwayId, neuronId);
    }

    function removePathwayFromNeuronAssociatedPathways(uint256 brainstemId, uint256 pathwayId, uint256 neuronId) internal {
        for (uint256 i = 0; i < brainstemCompaniesAssociatedPathways[brainstemId][neuronId].length; i++) {
            if (brainstemCompaniesAssociatedPathways[brainstemId][neuronId][i] == pathwayId) {
                brainstemCompaniesAssociatedPathways[brainstemId][neuronId][i] = brainstemCompaniesAssociatedPathways[brainstemId][neuronId][brainstemCompaniesAssociatedPathways[brainstemId][neuronId].length - 1];
                brainstemCompaniesAssociatedPathways[brainstemId][neuronId].pop();
                break;
            }
        }
    }

    function registerAsset(
        uint256 brainstemId,
        uint256 pathwayId,
        uint256 neuronId,
        uint256 assetId
    ) external override {
        require(assets.creatorOf(assetId) == msg.sender, "user not admin of asset");
        require(neuronUsers[neuronId][msg.sender], "user not part of the neuron");
        require(!brainstemPathwayAssets[brainstemId][pathwayId][assetId], "asset already registered in pathway");

        brainstemPathwayAssets[brainstemId][pathwayId][assetId] = true;
        emit AssetRegistered(brainstemId, pathwayId, assetId);
    }

    function getBrainstem(uint256 id) external view override returns (Unit memory) {
        return brainstems[id];
    }

    function getNeuron(uint256 id) external view override returns (Unit memory) {
        return companies[id];
    }

    function getPathway(uint256 brainstemId, uint256 pathwayId) external view override returns (Unit memory) {
        return brainstemPathways[brainstemId][pathwayId];
    }

    function getNeuronAssociatedPathways(uint256 brainstemId, uint256 neuronId) external view override returns (uint256[] memory) {
        return brainstemCompaniesAssociatedPathways[brainstemId][neuronId];
    }

    function userInNeuron(uint256 neuronId, address user) external view override returns (bool) {
        return neuronUsers[neuronId][user];
    }

    function neuronInBrainstem(uint256 brainstemId, uint256 neuronId) external view override returns (bool) {
        return brainstemCompanies[brainstemId][neuronId].id != 0;
    }

    function neuronInPathway(uint256 brainstemId, uint256 pathwayId, uint256 neuronId) external view override returns (bool) {
        return brainstemPathwaysCompanies[brainstemId][pathwayId][neuronId].id != 0;
    }

    function assetInPathway(uint256 brainstemId, uint256 pathwayId, uint256 assetId) external view override returns (bool) {
        return brainstemPathwayAssets[brainstemId][pathwayId][assetId];
    }
}
