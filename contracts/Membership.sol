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

    function createNeuron(Unit calldata neuron) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(neuron.id != 0, "neuron id cannot be 0");
        require(companies[neuron.id].id == 0, "neuron id already registered");
        
        companies[neuron.id] = neuron;
        emit NeuronCreated(neuron.id, neuron);
    }

    function createBrainstem(Unit calldata brainstem, uint256 ecosystemId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(brainstem.id != 0, "brainstem id cannot be 0");
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemBrainstems[ecosystemId][brainstem.id].id == 0, "brainstem id already registered in ecosystem");
        
        ecosystemBrainstems[ecosystemId][brainstem.id] = brainstem;
        emit BrainstemCreated(brainstem.id, brainstem, ecosystemId);
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
        require(ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId].length == 0, "neuron part of brainstem");

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

    function addBrainstemNeuron(uint256 ecosystemId, uint256 brainstemId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemBrainstems[ecosystemId][brainstemId].id != 0, "brainstem id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(ecosystemCompanies[ecosystemId][neuronId].id != 0, "neuron not part of ecosystem");
        require(ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId].length == 0, "neuron already part of brainstem");

        ecosystemBrainstemsCompanies[ecosystemId][brainstemId][neuronId] = companies[neuronId];
        ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId].push(brainstemId);

        emit BrainstemNeuronAdded(ecosystemId, brainstemId, neuronId);
    }

    function removeBrainstemNeuron(uint256 ecosystemId, uint256 brainstemId, uint256 neuronId) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystems[ecosystemId].id != 0, "ecosystem id not found");
        require(ecosystemBrainstems[ecosystemId][brainstemId].id != 0, "brainstem id not found");
        require(companies[neuronId].id != 0, "neuron id not found");
        require(ecosystemCompanies[ecosystemId][neuronId].id != 0, "neuron not part of ecosystem");
        require(ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId].length != 0, "neuron not part of brainstem");

        removeBrainstemFromNeuronAssociatedBrainstems(ecosystemId, brainstemId, neuronId);
        delete ecosystemBrainstemsCompanies[ecosystemId][brainstemId][neuronId];

        emit BrainstemNeuronRemoved(ecosystemId, brainstemId, neuronId);
    }

    function removeBrainstemFromNeuronAssociatedBrainstems(uint256 ecosystemId, uint256 brainstemId, uint256 neuronId) internal {
        for (uint256 i = 0; i < ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId].length; i++) {
            if (ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId][i] == brainstemId) {
                ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId][i] = ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId][ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId].length - 1];
                ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId].pop();
                break;
            }
        }
    }

    function registerAsset(
        uint256 ecosystemId,
        uint256 brainstemId,
        uint256 neuronId,
        uint256 assetId
    ) external override {
        require(assets.creatorOf(assetId) == msg.sender, "user not admin of asset");
        require(neuronUsers[neuronId][msg.sender], "user not part of the neuron");
        require(!ecosystemBrainstemAssets[ecosystemId][brainstemId][assetId], "asset already registered in brainstem");

        ecosystemBrainstemAssets[ecosystemId][brainstemId][assetId] = true;
        emit AssetRegistered(ecosystemId, brainstemId, assetId);
    }

    function getEcosystem(uint256 id) external view override returns (Unit memory) {
        return ecosystems[id];
    }

    function getNeuron(uint256 id) external view override returns (Unit memory) {
        return companies[id];
    }

    function getBrainstem(uint256 ecosystemId, uint256 brainstemId) external view override returns (Unit memory) {
        return ecosystemBrainstems[ecosystemId][brainstemId];
    }

    function getNeuronAssociatedBrainstems(uint256 ecosystemId, uint256 neuronId) external view override returns (uint256[] memory) {
        return ecosystemCompaniesAssociatedBrainstems[ecosystemId][neuronId];
    }

    function userInNeuron(uint256 neuronId, address user) external view override returns (bool) {
        return neuronUsers[neuronId][user];
    }

    function neuronInEcosystem(uint256 ecosystemId, uint256 neuronId) external view override returns (bool) {
        return ecosystemCompanies[ecosystemId][neuronId].id != 0;
    }

    function neuronInBrainstem(uint256 ecosystemId, uint256 brainstemId, uint256 neuronId) external view override returns (bool) {
        return ecosystemBrainstemsCompanies[ecosystemId][brainstemId][neuronId].id != 0;
    }

    function assetInBrainstem(uint256 ecosystemId, uint256 brainstemId, uint256 assetId) external view override returns (bool) {
        return ecosystemBrainstemAssets[ecosystemId][brainstemId][assetId];
    }
}
