import "./App.css";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { useWeb3React } from "@web3-react/core";
import Connected from "./component/Connected";
import { useEffect } from "react";

const WALLETCONNECT_BRIDGE_URL = "https://bridge.walletconnect.org";
const INFURA_KEY = "10df728faa6e46bea492bea63eaba945";
const NETWORK_URLS = {
  4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
};

const injected = new InjectedConnector({
  supportedChainIds: [4],
});

const walletConnectConnector = new WalletConnectConnector({
  supportedChainIds: [4],
  rpc: NETWORK_URLS,
  bridge: WALLETCONNECT_BRIDGE_URL,
  qrcode: true,
});

function App() {
  const { account, activate } = useWeb3React();
  const connectInjectedConnector = () => {
    activate(injected);
  };

  const checkConnected = async () => {
    const isLogged = await injected.isAuthorized()
    if (isLogged) {
      activate(injected);
    }
  }

  const connectWalletConnectConnector = () => {
    activate(walletConnectConnector, undefined, true).catch(e => console.log('ee', e));
  };

  useEffect(() => {
    checkConnected()
  }, [])
  return (
    <div className="App">
      <div style={{ marginTop: "4rem" }}>
        {
          account ?
            <>
              <Connected
                account={account}  >
              </Connected>
            </> :
            <>
              <div style={{ width: '500px', margin: '0px auto', border: '1px solid #000', padding: '20px' }}>
                <button className="btn btn-primary" onClick={connectInjectedConnector}>Connect Metamask</button>
                <br />
                <button className="btn btn-primary" style={{ marginTop: '3rem' }} onClick={connectWalletConnectConnector}>Connect WalletConnect</button>
              </div>
            </>

        }
      </div>
    </div>
  );
}

export default App;
