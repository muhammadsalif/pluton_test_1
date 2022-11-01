import './App.css';
import Web3 from "web3";
import contractAbi from "./contractAbi.json";
import { useState, useEffect } from 'react';
import MetaMaskSvg from "./assets/metamask.svg";
import axios from 'axios';

function App() {

  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [contractAddress, setContractAddress] = useState(
    "0x00295AC0C326bDBEb7933FFD63A6300E7B7A4beC"
  );
  const [selectedAccount, setSelectedAccount] = useState("");
  const [provider, setProvider] = useState();
  const [nftsData, setNftsData] = useState();
  const [noNfts, setNoNfts] = useState(false);
  const changeProvider = (newProvider) => {
    setProvider(newProvider);
  };

  const connectWalletHandle = (wallet) => {
    changeProvider("");
    if (wallet === "metamask") {
      changeProvider(window.ethereum);
    }
  };

  let smartContract;
  let isInitialized = false;
  let web3;

  const walletConnectInit = async () => {
    await provider.enable();

    web3 = new Web3(provider);
    window.web3 = web3;

    var accounts = await web3.eth.getAccounts();

    setSelectedAccount(accounts[0]);
    if (selectedAccount) {
      setIsWalletConnected(true);
      // return;
    } else {
      setIsWalletConnected(false);
      // return;
    }

    smartContract = new web3.eth.Contract(contractAbi, contractAddress);

    isInitialized = true;

  };

  const init = async () => {

    if (provider == undefined) return;

    if (provider.isWalletConnect) await walletConnectInit();

    else {
      if (typeof provider == "undefined") {
        setIsWalletInstalled(false);
        return;
      }
      if (typeof provider !== "undefined") {
        // metamask is installed
        setIsWalletInstalled(true);

        provider
          .request({ method: "eth_requestAccounts" })
          .then(async (accounts) => {
            setSelectedAccount(accounts[0]);
            if (selectedAccount) {
              setIsWalletConnected(true);
              return;
            } else {
              setIsWalletConnected(false);
              return;
            }
          })
          .catch((err) => console.error(err));

        // on changing of account in metamask
        window.ethereum.on("accountsChanged", async function (accounts) {
          if (accounts.length > 0) {
            setSelectedAccount(accounts[0]);
            if (selectedAccount) {
              setIsWalletConnected(true);
              return;
            } else {
              setIsWalletConnected(false);
              return;
            }
          } else {
            window.location.reload();
          }
        });
        // on changing chain in metamask
        window.ethereum.on("chainChanged", (chainId) => {
          // Handle the new chain.
          // Correctly handling chain changes can be complicated.
          // We recommend reloading the page unless you have good reason not to.
          window.location.reload();
        });
      }

      web3 = new Web3(provider);

      const networkId = await web3.eth.net.getId();

      smartContract = new web3.eth.Contract(contractAbi, contractAddress);

      isInitialized = true;
    }
  };

  const checkConnection = async () => {
    let accounts = await provider
      .request({ method: "eth_accounts" })
      .catch(console.error);
    return accounts;
  };

  // init function
  useEffect(() => {
    init();
  }, [provider, isWalletConnected]);

  // checking wallet connection
  useEffect(() => {
    async function temp() {
      if (!isWalletInstalled) return;
      let walletsList = await checkConnection();
      if (walletsList.length === 0) {
        setIsWalletConnected(false);
      } else {
        setIsWalletConnected(true);
      }
    }
    temp();
  }, []);

  const fetchNfts = async () => {
    if (!isInitialized) {
      await init();
    }
    const temp = await smartContract.methods.balanceOf(selectedAccount).call();
    console.log(temp)
    if (temp == 0) {
      setNoNfts(true)
    }
    let tokenUris = [];
    for (let i = 1; i <= temp; i++) {
      let newUri = await smartContract.methods.tokenURI(i).call({ from: selectedAccount });
      tokenUris.push(newUri);
    }

    let responses = []
    for (let i = 0; i < tokenUris.length; i++) {
      let response = await axios.get(tokenUris[i]);
      responses.push(response.data)
    }
    setNftsData(responses);

  };

  useEffect(() => {
    if (selectedAccount) {
      fetchNfts()
    }
  }, [selectedAccount, smartContract])

  useEffect(() => {
    if (window.ethereum) setProvider(window.ethereum)
  }, [])

  const renderMetaMask = () => {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          margin: "0 auto",
        }}
        onClick={() => connectWalletHandle("metamask")}
      >
        <button style={{ padding: "1em" }}>
          <h2>Connect Metamask</h2>
          <img src={MetaMaskSvg} />
        </button>
      </div >
    )
  }


  return (
    <>
      {
        !isWalletConnected && (
          <div style={{ zIndex: "-1" }} className="bg">
            <h1>Wallet Not <br /> Connected</h1>
          </div>
        )
      }
      {
        noNfts && (
          <div style={{ zIndex: "-1" }} className="bg">
            <h1>No Nfts minted by your address</h1>
          </div>
        )
      }
      {renderMetaMask()}
      <div style={{ display: "flex" }}>
        {nftsData?.map((eachNft, index) => {
          return (
            <div key={index} className="nft">
              <div className='main'>
                <img className='tokenImage' src={eachNft?.image} alt="NFT" />
                <h2>{eachNft?.name}</h2>
                <p className='description'>Our Nft's will give you nothing, waste your money on us.</p>
                <div className='tokenInfo'>
                  <div className="price">
                    <ins>◘</ins>
                    <p>1 MST</p>
                  </div>
                  <div className="duration">
                    <ins>◷</ins>
                    <p>11 days ago</p>
                  </div>
                </div>
                <hr />
                <div className='creator'>
                  <div className='wrapper'>
                    <img src="https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80" alt="Creator" />
                  </div>
                  <p><ins>Creation of</ins> Marketplace</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  );
}

export default App;
