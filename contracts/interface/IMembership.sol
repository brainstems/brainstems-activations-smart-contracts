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
    event BrainstemCreated(uint256 indexed id, Unit brainstem, uint256 ecosystemId);

    event EcosystemNeuronAdded(uint256 indexed ecosystemId, uint256 indexed neuronId);
    event EcosystemNeuronRemoved(uint256 indexed ecosystemId, uint256 indexed neuronId);
    
    event UserAdded(uint256 indexed neuronId, address user);
    event UserRemoved(uint256 indexed neuronId, address user);

    event BrainstemNeuronAdded(uint256 indexed ecosystemId, uint256 indexed brainstemId, uint256 indexed neuronId);
    event BrainstemNeuronRemoved(uint256 indexed ecosystemId, uint256 indexed brainstemId, uint256 indexed neuronId);

    event AssetRegistered(uint256 indexed ecosystemId, uint256 indexed brainstemId, uint256 indexed assetId);

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
     * @notice Registers a brainstem within an ecosystem in the contract.
     * @param brainstem object properties for the brainstem.
     */
    function createBrainstem(Unit calldata brainstem, uint256 ecosystemId) external;

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
     * @notice Attaches a Neuron to an Brainstem.
     * @param ecosystemId identifier for the ecosystem.
     * @param brainstemId identifier for the brainstem.
     * @param neuronId identifier for the neuron.
     */
    function addBrainstemNeuron(uint256 ecosystemId, uint256 brainstemId, uint256 neuronId) external;

    /**
     * @notice Removes a Neuron from an Brainstem.
     * @param ecosystemId identifier for the ecosystem.
     * @param brainstemId identifier for the brainstem.
     * @param neuronId identifier for the neuron.
     */
    function removeBrainstemNeuron(uint256 ecosystemId, uint256 brainstemId, uint256 neuronId) external;

    /**
     * @notice Binds an asset to a brainstem.
     */
    function registerAsset(uint256 ecosystemId, uint256 brainstemId, uint256 neuronId, uint256 assetId) external;

    /**
     * @notice Returns the detailed ecosystem identified by the provided id.
     */
    function getEcosystem(uint256 ecosystemId) external view returns (Unit memory);

    /**
     * @notice Returns the detailed neuron identified by the provided id.
     */
    function getNeuron(uint256 neuronId) external view returns (Unit memory);

    /**
     * @notice Returns the detailed brainstem identified by the provided id.
     */
    function getBrainstem(uint256 ecosystemId, uint256 brainstemId) external view returns (Unit memory);

    /**
     * @notice Returns the list of associated brainstems for a given neuron in ecosystem.
     */
    function getNeuronAssociatedBrainstems(uint256 ecosystemId, uint256 neuronId) external view returns (uint256[] memory);

    /**
     * @notice Returns if the given user belongs to a given neuron.
     */
    function userInNeuron(uint256 neuronId, address user) external view returns (bool);

    /**
     * @notice Returns if the given neuron belong to the given ecosystem.
     */
    function neuronInEcosystem(uint256 ecosystemId, uint256 neuronId) external view returns (bool);
    
    /**
     * @notice Returns if the given neuron is in the given brainstem.
     */
    function neuronInBrainstem(uint256 ecosystemId, uint256 brainstemId, uint256 neuronId) external view returns (bool);

    /**
     * @notice Returns if the given asset is in the given brainstem.
     */
    function assetInBrainstem(uint256 ecosystemId, uint256 brainstemId, uint256 assetId) external view returns (bool);
}
