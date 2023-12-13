import { Barretenberg, Fr } from "@aztec/bb.js";
import { BarretenbergBackend, CompiledCircuit } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import { ethers } from "hardhat";
import circuit from "../circuits/target/circuits.json";
import { Membership, UltraVerifier } from "../typechain-types";
import { MerkleTree } from "../utils/merkleTree";

describe("Membership", () => {
  let secrets = Array(10)
    .fill(0)
    .map(() => Fr.random());
  let verifier: UltraVerifier;
  let contract: Membership;
  let merkleTree: MerkleTree;
  let backend: Barretenberg;
  let noir: Noir;

  before(async () => {
    backend = await Barretenberg.new();
    noir = new Noir(
      circuit as unknown as CompiledCircuit,
      new BarretenbergBackend(circuit as unknown as CompiledCircuit)
    );
    await noir.init();

    merkleTree = new MerkleTree(4);

    let hashedSecrets = [];
    for (let i = 0; i < 10; i++) {
      hashedSecrets.push(await backend.pedersenHashMultiple([secrets[i]]));
    }

    await merkleTree.initialize(hashedSecrets);

    const UltraVerifier = await ethers.getContractFactory("UltraVerifier");
    verifier = await UltraVerifier.deploy();
    await verifier.waitForDeployment();

    const Membership = await ethers.getContractFactory("Membership");
    contract = await Membership.deploy(verifier.getAddress(), merkleTree.root().toString());
    await contract.waitForDeployment();
  });

  after(async () => await noir.destroy());

  it("should work", async () => {
    const publicInputs = {
      secret: secrets[0].toString(),
      index: 0,
      root: merkleTree.root().toString(),
      hash_path: (await merkleTree.proof(0)).pathElements.map((x) => x.toString()),
    };

    let hash;
    hash = await backend.pedersenHashMultiple([
      await backend.pedersenHashMultiple([secrets[0]]),
      Fr.fromString(publicInputs.hash_path[0]),
    ]);
    hash = await backend.pedersenHashMultiple([hash, Fr.fromString(publicInputs.hash_path[1])]);
    hash = await backend.pedersenHashMultiple([hash, Fr.fromString(publicInputs.hash_path[2])]);
    hash = await backend.pedersenHashMultiple([hash, Fr.fromString(publicInputs.hash_path[3])]);

    publicInputs.root = hash.toString();

    const proof = await noir.generateFinalProof(publicInputs);
    await noir.verifyFinalProof(proof);

    await contract.exclusive(proof.proof, [ethers.hexlify(publicInputs.root)]);
  });
});
