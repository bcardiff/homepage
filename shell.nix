# Pin nixpkgs to ensure all developers use the same version of devenv.
#
# To update: change the rev below and run:
#   nix-prefetch-url --unpack https://github.com/NixOS/nixpkgs/archive/<NEW_REV>.tar.gz
# Then replace the sha256 with the output.
{
  pkgs ? import (fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/8c50a710ddca43d7a530fb805ad55bde8d0141c5.tar.gz";
    sha256 = "0am8xx09fx5yf2p0wb001v0jx1g5hrfb76h4r37xph378jgk7pcr";
  }) {}
}:

pkgs.mkShell {
  buildInputs = with pkgs; [
    devenv
  ];

  shellHook = ''
    echo "devenv environment loaded"
  '';
}