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

    event BrainstemCreated(uint256 indexed id, Unit brainstem);
    event NeuronCreated(uint256 indexed id, Unit neuron);
    event PathwayCreated(uint256 indexed id, Unit pathway, uint256 brainstemId);

    event BrainstemNeuronAdded(uint256 indexed brainstemId, uint256 indexed neuronId);
    event BrainstemNeuronRemoved(uint256 indexed brainstemId, uint256 indexed neuronId);
    
    event UserAdded(uint256 indexed neuronId, address user);
    event UserRemoved(uint256 indexed neuronId, address user);

    event PathwayNeuronAdded(uint256 indexed brainstemId, uint256 indexed pathwayId, uint256 indexed neuronId);
    event PathwayNeuronRemoved(uint256 indexed brainstemId, uint256 indexed pathwayId, uint256 indexed neuronId);

    event AssetRegistered(uint256 indexed brainstemId, uint256 indexed pathwayId, uint256 indexed assetId);

    /**
     * @notice Registers an brainstem in the contract.
     * @param brainstem object properties for the brainstem.
     */
    function createBrainstem(Unit calldata brainstem) external;

    /**
     * @notice Registers a neuron in the contract.
     * @param neuron object properties for the neuron.
     */
    function createNeuron(Unit calldata neuron) external;

    /**
     * @notice Registers a pathway within an brainstem in the contract.
     * @param pathway object properties for the pathway.
     */
    function createPathway(Unit calldata pathway, uint256 brainstemId) external;

    /**
     * @notice Attaches a Neuron to an Brainstem.
     * @param brainstemId identifier for the brainstem.
     * @param neuronId identifier for the neuron.
     */
    function addBrainstemNeuron(uint256 brainstemId, uint256 neuronId) external;

    /**
     * @notice Removes a Neuron from an Brainstem.
     * @param brainstemId identifier for the brainstem.
     * @param neuronId identifier for the neuron.
     */
    function removeBrainstemNeuron(uint256 brainstemId, uint256 neuronId) external;

    /**
     * @notice Adds a user to a neuron within an brainstem.
     * @param neuronId identifier for the neuron.
     * @param users addresses of the users to add.
     */
    function addUsers(
        uint256 neuronId,
        address[] memory users
    ) external;

    /**
     * @notice Remove a user to a neuron within an brainstem.
     * @param neuronId identifier for the neuron.
     * @param users addresses of the users.
     */
    function removeUsers(
        uint256 neuronId,
        address[] memory users
    ) external;

    /**
     * @notice Attaches a Neuron to an Pathway.
     * @param brainstemId identifier for the brainstem.
     * @param pathwayId identifier for the pathway.
     * @param neuronId identifier for the neuron.
     */
    function addPathwayNeuron(uint256 brainstemId, uint256 pathwayId, uint256 neuronId) external;

    /**
     * @notice Removes a Neuron from an Pathway.
     * @param brainstemId identifier for the brainstem.
     * @param pathwayId identifier for the pathway.
     * @param neuronId identifier for the neuron.
     */
    function removePathwayNeuron(uint256 brainstemId, uint256 pathwayId, uint256 neuronId) external;

    /**
     * @notice Binds an asset to a pathway.
     */
    function registerAsset(uint256 brainstemId, uint256 pathwayId, uint256 neuronId, uint256 assetId) external;

    /**
     * @notice Returns the detailed brainstem identified by the provided id.
     */
    function getBrainstem(uint256 brainstemId) external view returns (Unit memory);

    /**
     * @notice Returns the detailed neuron identified by the provided id.
     */
    function getNeuron(uint256 neuronId) external view returns (Unit memory);

    /**
     * @notice Returns the detailed pathway identified by the provided id.
     */
    function getPathway(uint256 brainstemId, uint256 pathwayId) external view returns (Unit memory);

    /**
     * @notice Returns the list of associated pathways for a given neuron in brainstem.
     */
    function getNeuronAssociatedPathways(uint256 brainstemId, uint256 neuronId) external view returns (uint256[] memory);

    /**
     * @notice Returns if the given user belongs to a given neuron.
     */
    function userInNeuron(uint256 neuronId, address user) external view returns (bool);

    /**
     * @notice Returns if the given neuron belong to the given brainstem.
     */
    function neuronInBrainstem(uint256 brainstemId, uint256 neuronId) external view returns (bool);
    
    /**
     * @notice Returns if the given neuron is in the given pathway.
     */
    function neuronInPathway(uint256 brainstemId, uint256 pathwayId, uint256 neuronId) external view returns (bool);

    /**
     * @notice Returns if the given asset is in the given pathway.
     */
    function assetInPathway(uint256 brainstemId, uint256 pathwayId, uint256 assetId) external view returns (bool);
}
