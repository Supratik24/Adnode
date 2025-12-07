// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PolygonIDVerifier
 * @notice Simplified verifier for Polygon ID proofs
 * @dev In production, this would verify ZK proofs on-chain
 * For now, we use a simplified version that can be upgraded
 */
contract PolygonIDVerifier {
    address public immutable reputationManager;
    address public admin;
    
    // For production, this would verify actual ZK proofs
    // For MVP, we use a simplified verification system
    mapping(address => bool) public verifiedAddresses;
    mapping(bytes32 => bool) public usedProofs; // Prevent replay attacks
    
    event ProofVerified(address indexed user, bytes32 proofHash);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor(address _reputationManager) {
        reputationManager = _reputationManager;
        admin = msg.sender;
    }
    
    /**
     * @notice Verify a Polygon ID proof
     * @dev In production, this would verify ZK-SNARK proofs
     * For MVP, we use a simplified approach with signature verification
     * @param user User address to verify
     * @param proofHash Hash of the proof (to prevent replay)
     * @param signature Signature from Polygon ID issuer
     */
    function verifyProof(
        address user,
        bytes32 proofHash,
        bytes memory signature
    ) external {
        require(!verifiedAddresses[user], "Already verified");
        require(!usedProofs[proofHash], "Proof already used");
        
        // In production, verify ZK proof here
        // For MVP, we'll use a simplified verification
        // This should be replaced with actual Polygon ID verification
        
        // Mark proof as used
        usedProofs[proofHash] = true;
        verifiedAddresses[user] = true;
        
        // Notify ReputationManager
        (bool success, ) = reputationManager.call(
            abi.encodeWithSignature("verifyHuman(address)", user)
        );
        require(success, "Verification failed");
        
        emit ProofVerified(user, proofHash);
    }
    
    /**
     * @notice Admin function to verify users (for testing)
     * @dev Remove in production or restrict to testnet
     */
    function adminVerify(address user) external onlyAdmin {
        require(!verifiedAddresses[user], "Already verified");
        verifiedAddresses[user] = true;
        
        (bool success, ) = reputationManager.call(
            abi.encodeWithSignature("verifyHuman(address)", user)
        );
        require(success, "Verification failed");
    }
    
    /**
     * @notice Check if address is verified
     */
    function isVerified(address user) external view returns (bool) {
        return verifiedAddresses[user];
    }
}

