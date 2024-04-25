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
    event CompanyCreated(uint256 indexed id, Unit company);
    event BrainstemCreated(uint256 indexed id, Unit brainstem, uint256 ecosystemId);

    event EcosystemCompanyAdded(uint256 indexed ecosystemId, uint256 indexed companyId);
    event EcosystemCompanyRemoved(uint256 indexed ecosystemId, uint256 indexed companyId);
    
    event UserAdded(uint256 indexed companyId, address user);
    event UserRemoved(uint256 indexed companyId, address user);

    event BrainstemCompanyAdded(uint256 indexed ecosystemId, uint256 indexed brainstemId, uint256 indexed companyId);
    event BrainstemCompanyRemoved(uint256 indexed ecosystemId, uint256 indexed brainstemId, uint256 indexed companyId);

    event AssetRegistered(uint256 indexed ecosystemId, uint256 indexed brainstemId, uint256 indexed assetId);

    /**
     * @notice Registers an ecosystem in the contract.
     * @param ecosystem object properties for the ecosystem.
     */
    function createEcosystem(Unit calldata ecosystem) external;

    /**
     * @notice Registers a company in the contract.
     * @param company object properties for the company.
     */
    function createCompany(Unit calldata company) external;

    /**
     * @notice Registers a brainstem within an ecosystem in the contract.
     * @param brainstem object properties for the brainstem.
     */
    function createBrainstem(Unit calldata brainstem, uint256 ecosystemId) external;

    /**
     * @notice Attaches a Company to an Ecosystem.
     * @param ecosystemId identifier for the ecosystem.
     * @param companyId identifier for the company.
     */
    function addEcosystemCompany(uint256 ecosystemId, uint256 companyId) external;

    /**
     * @notice Removes a Company from an Ecosystem.
     * @param ecosystemId identifier for the ecosystem.
     * @param companyId identifier for the company.
     */
    function removeEcosystemCompany(uint256 ecosystemId, uint256 companyId) external;

    /**
     * @notice Adds a user to a company within an ecosystem.
     * @param companyId identifier for the company.
     * @param users addresses of the users to add.
     */
    function addUsers(
        uint256 companyId,
        address[] memory users
    ) external;

    /**
     * @notice Remove a user to a company within an ecosystem.
     * @param companyId identifier for the company.
     * @param users addresses of the users.
     */
    function removeUsers(
        uint256 companyId,
        address[] memory users
    ) external;

    /**
     * @notice Attaches a Company to an Brainstem.
     * @param ecosystemId identifier for the ecosystem.
     * @param brainstemId identifier for the brainstem.
     * @param companyId identifier for the company.
     */
    function addBrainstemCompany(uint256 ecosystemId, uint256 brainstemId, uint256 companyId) external;

    /**
     * @notice Removes a Company from an Brainstem.
     * @param ecosystemId identifier for the ecosystem.
     * @param brainstemId identifier for the brainstem.
     * @param companyId identifier for the company.
     */
    function removeBrainstemCompany(uint256 ecosystemId, uint256 brainstemId, uint256 companyId) external;

    /**
     * @notice Binds an asset to a brainstem.
     */
    function registerAsset(uint256 ecosystemId, uint256 brainstemId, uint256 companyId, uint256 assetId) external;

    /**
     * @notice Returns the detailed ecosystem identified by the provided id.
     */
    function getEcosystem(uint256 ecosystemId) external view returns (Unit memory);

    /**
     * @notice Returns the detailed company identified by the provided id.
     */
    function getCompany(uint256 companyId) external view returns (Unit memory);

    /**
     * @notice Returns the detailed brainstem identified by the provided id.
     */
    function getBrainstem(uint256 brainstemId) external view returns (Unit memory);

    /**
     * @notice Returns the list of associated brainstems for a given company in ecosystem.
     */
    function getCompanyAssociatedBrainstems(uint256 ecosystemId, uint256 companyId) external view returns (uint256[] memory);

    /**
     * @notice Returns if the given user belongs to a given company.
     */
    function userInCompany(uint256 companyId, address user) external view returns (bool);

    /**
     * @notice Returns if the given company belong to the given ecosystem.
     */
    function companyInEcosystem(uint256 ecosystemId, uint256 companyId) external view returns (bool);
    
    /**
     * @notice Returns if the given company is in the given brainstem.
     */
    function companyInBrainstem(uint256 brainstemId, uint256 companyId) external view returns (bool);

    /**
     * @notice Returns if the given asset is in the given brainstem.
     */
    function assetInBrainstem(uint256 ecosystemId, uint256 brainstemId, uint256 assetId) external view returns (bool);
}
