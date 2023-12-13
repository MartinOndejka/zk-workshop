// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {UltraVerifier} from "../circuits/contract/circuits/plonk_vk.sol";

contract Membership is UltraVerifier {
    bytes32 public merkleRoot;

    UltraVerifier public immutable verifier;

    int public counter = 0;

    constructor(UltraVerifier _verifier, bytes32 _merkleRoot) {
        verifier = _verifier;
        merkleRoot = _merkleRoot;
    }

    function exclusive(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external {
        require(verifier.verify(proof, publicInputs));

        counter++;
    }
}
