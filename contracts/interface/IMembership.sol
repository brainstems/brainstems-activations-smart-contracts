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

interface IMembership {
    struct Unit {
        uint256 id;
        string name;
    }

    event EcosystemCreated(uint256 indexed id, Unit ecosystem);
    event NeuronCreated(uint256 indexed id, Unit neuron);
    event PathwayCreated(uint256 indexed id, Unit pathway, uint256 ecosystemId);

    event EcosystemNeuronAdded(uint256 indexed ecosystemId, uint256 indexed neuronId);
    event EcosystemNeuronRemoved(uint256 indexed ecosystemId, uint256 indexed neuronId);
    
    event UserAdded(uint256 indexed neuronId, address user);
    event UserRemoved(uint256 indexed neuronId, address user);

    event PathwayNeuronAdded(uint256 indexed ecosystemId, uint256 indexed pathwayId, uint256 indexed neuronId);
    event PathwayNeuronRemoved(uint256 indexed ecosystemId, uint256 indexed pathwayId, uint256 indexed neuronId);

    event AssetRegistered(uint256 indexed ecosystemId, uint256 indexed pathwayId, uint256 indexed assetId);

    /**
     * @notice Registers an ecosystem in the contract.
     * @param ecosystem object properties for the ecosystem.
     */
    function createEcosystem(Unit calldata ecosystem) external;

    /**
     * @notice Registers a neuron in the contract.
     * @param neuron object properties for the neuron.
     */
    function createNeuron(Unit calldata neuron) external;

    /**
     * @notice Registers a pathway within an ecosystem in the contract.
     * @param pathway object properties for the pathway.
     */
    function createPathway(Unit calldata pathway, uint256 ecosystemId) external;

    /**
     * @notice Attaches a Neuron to an Ecosystem.
     * @param ecosystemId identifier for the ecosystem.
     * @param neuronId identifier for the neuron.
     */
    function addEcosystemNeuron(uint256 ecosystemId, uint256 neuronId) external;

    /**
     * @notice Removes a Neuron from an Ecosystem.
     * @param ecosystemId identifier for the ecosystem.
     * @param neuronId identifier for the neuron.
     */
    function removeEcosystemNeuron(uint256 ecosystemId, uint256 neuronId) external;

    /**
     * @notice Adds a user to a neuron within an ecosystem.
     * @param neuronId identifier for the neuron.
     * @param users addresses of the users to add.
     */
    function addUsers(
        uint256 neuronId,
        address[] memory users
    ) external;

    /**
     * @notice Remove a user to a neuron within an ecosystem.
     * @param neuronId identifier for the neuron.
     * @param users addresses of the users.
     */
    function removeUsers(
        uint256 neuronId,
        address[] memory users
    ) external;

    /**
     * @notice Attaches a Neuron to an Pathway.
     * @param ecosystemId identifier for the ecosystem.
     * @param pathwayId identifier for the pathway.
     * @param neuronId identifier for the neuron.
     */
    function addPathwayNeuron(uint256 ecosystemId, uint256 pathwayId, uint256 neuronId) external;

    /**
     * @notice Removes a Neuron from an Pathway.
     * @param ecosystemId identifier for the ecosystem.
     * @param pathwayId identifier for the pathway.
     * @param neuronId identifier for the neuron.
     */
    function removePathwayNeuron(uint256 ecosystemId, uint256 pathwayId, uint256 neuronId) external;

    /**
     * @notice Binds an asset to a pathway.
     */
    function registerAsset(uint256 ecosystemId, uint256 pathwayId, uint256 neuronId, uint256 assetId) external;

    /**
     * @notice Returns the detailed ecosystem identified by the provided id.
     */
    function getEcosystem(uint256 ecosystemId) external view returns (Unit memory);

    /**
     * @notice Returns the detailed neuron identified by the provided id.
     */
    function getNeuron(uint256 neuronId) external view returns (Unit memory);

    /**
     * @notice Returns the detailed pathway identified by the provided id.
     */
    function getPathway(uint256 ecosystemId, uint256 pathwayId) external view returns (Unit memory);

    /**
     * @notice Returns the list of associated pathways for a given neuron in ecosystem.
     */
    function getNeuronAssociatedPathways(uint256 ecosystemId, uint256 neuronId) external view returns (uint256[] memory);

    /**
     * @notice Returns if the given user belongs to a given neuron.
     */
    function userInNeuron(uint256 neuronId, address user) external view returns (bool);

    /**
     * @notice Returns if the given neuron belong to the given ecosystem.
     */
    function neuronInEcosystem(uint256 ecosystemId, uint256 neuronId) external view returns (bool);
    
    /**
     * @notice Returns if the given neuron is in the given pathway.
     */
    function neuronInPathway(uint256 ecosystemId, uint256 pathwayId, uint256 neuronId) external view returns (bool);

    /**
     * @notice Returns if the given asset is in the given pathway.
     */
    function assetInPathway(uint256 ecosystemId, uint256 pathwayId, uint256 assetId) external view returns (bool);
}
