use dep::std;

fn main(secret: Field, index: Field, hash_path: [Field; 4], root: pub Field) {
    let leaf = std::hash::pedersen_hash([secret]);
    let merkle_root = std::merkle::compute_merkle_root(leaf, index, hash_path);
    assert(merkle_root == root);
}

#[test]
fn test_add() {
    main(
        0x0bbac03dc66554ea9101cda81b1f5a4cb50fab8157c446b1bc8b5f57ccebcdeb,
        0,
        [
        0x189d6e358195952f84a7bf3255554faf10356523afbaddc9bbf420cf774d1ac8,
        0x1fac57878609f9b84a4edd24922c3df8e374ed1b38bfe13e85e98faebc3a32f1,
        0x114618eecec0c238a03614f05794d07fa5d475dbe9529731dc3a5fdea56f109f,
        0x017da8e77159817c08f0f4b473bbc2f94194d9560de986325ac4ca7aa1d64f46
    ],
        0x08d83388d67a9a931027382d93252eabe243babd9020c78769749370e984ade9
    );
}
