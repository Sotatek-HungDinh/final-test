import "./App.css";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { useWeb3React } from "@web3-react/core";
import AfterConnect from "./component/AfterConnect";
import { useEffect } from "react";

const WALLETCONNECT_BRIDGE_URL = "https://bridge.walletconnect.org";
const INFURA_KEY = "10df728faa6e46bea492bea63eaba945";
const NETWORK_URLS = {
  1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  5: `https://goerli.infura.io/v3/${INFURA_KEY}`,
};

const injected = new InjectedConnector({
  supportedChainIds: [1, 4, 5],
});

const walletConnectConnector = new WalletConnectConnector({
  supportedChainIds: [1, 4, 5],
  rpc: NETWORK_URLS,
  bridge: WALLETCONNECT_BRIDGE_URL,
  qrcode: true,
});

function App() {
  const { account, chainId, activate, library } = useWeb3React();
  const connectInjectedConnector = () => {
    activate(injected);
  };

  const connectWalletConnectConnector = () => {
    activate(walletConnectConnector, undefined, true).catch(e => console.log('ee', e));
  };

  useEffect(()=>{
    connectInjectedConnector()
  },[])
  return (
    <div className="App">
      <div style={{ marginTop: "4rem" }}>
        {
          account ?
            <>
              <AfterConnect
                account={account}  >
              </AfterConnect>
            </> :
            <> <button onClick={connectInjectedConnector}>Connect Metamask</button>
              <br />
              <button style={{ marginTop: '3rem' }} onClick={connectWalletConnectConnector}>Connect WalletConnect</button>
            </>
        }
      </div>
    </div>
  );
}

export default App;
