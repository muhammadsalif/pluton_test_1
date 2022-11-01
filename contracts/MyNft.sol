// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyNft is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    IERC20 public tokenAddress;
    uint256 public rate = 1 * 10**18;
    string public baseUri =
        "https://bafybeif4c5blldekb4c6tspf5oyyi2qqsnsc2d5xlshoo6733ibq36b3fm.ipfs.nftstorage.link/";
    bool public isRevealed = false;

    constructor(address _tokenAddress) ERC721("MyNft", "MNFT") {
        tokenAddress = IERC20(_tokenAddress);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    function changeUri(string memory newUri) public onlyOwner returns (bool) {
        baseUri = newUri;
        return true;
    }

    function checkRevealed() public view onlyOwner returns (bool) {
        return isRevealed;
    }

    function safeMint() public {
        require(_tokenIdCounter.current() < 3, "All Nft's minted");
        tokenAddress.transferFrom(msg.sender, address(this), rate);
        _tokenIdCounter.increment();
        if (_tokenIdCounter.current() == 3) {
            isRevealed = true;
            baseUri = "https://bafybeicphvbrm4y55gbm2d23b5ltjc7eu6a5hizhw65ymh4jnk33roe5c4.ipfs.nftstorage.link/";
        }
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);
    }

    function safeBulkMint() public {
        require(_tokenIdCounter.current() < 3, "All Nft's minted");
        tokenAddress.transferFrom(msg.sender, address(this), rate);
        _tokenIdCounter.increment();
        if (_tokenIdCounter.current() == 3) {
            isRevealed = true;
            baseUri = "https://bafybeicphvbrm4y55gbm2d23b5ltjc7eu6a5hizhw65ymh4jnk33roe5c4.ipfs.nftstorage.link/";
        }
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }
}
