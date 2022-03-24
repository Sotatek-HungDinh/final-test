
import { useEffect, useState } from "react";
import ERC20 from '../ERC20.json';
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";
import MCABI from '../MCABI.json'
import DD2 from '../DD2.json'
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Modal, ModalHeader, ModalBody, InputGroup, Input } from 'reactstrap';
import TableHistory from './TableHistory'

const ethereumMulticall = require('ethereum-multicall');

// const WALLETCONNECT_BRIDGE_URL = "https://bridge.walletconnect.org";
// const INFURA_KEY = "10df728faa6e46bea492bea63eaba945";
// const NETWORK_URLS = {
//   1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
//   4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
//   5: `https://goerli.infura.io/v3/${INFURA_KEY}`,
// };


function AfterConnect(props) {
  const { account, } = props
  const { library } = useWeb3React();
  const [balanceWeth, setBlanceWeth] = useState(0);
  const [dd2earned, setDD2earned] = useState(0)
  const [balanceDD2, setBalanceDD2] = useState(0)
  const [isNone, setIsNone] = useState("")
  const [isShowModalDeposit, setModalDeposit] = useState(false);
  const [isShowModalWithdraw, setModalWithdraw] = useState(false);
  const [valueDeposit, setValueDeposit] = useState(0);
  const [valueWithdraw, setValueWithdraw] = useState(0);
  const [yourStake, setYourStake] = useState(0)
  const [totalStake, setTotalStake] = useState(0)

  let isAllowance = 0

  const getStaticInfo = async () => {
    await multicall()
    if (isAllowance !== 0) setIsNone("none")
  };

  const multicall = async () => {
    const web3 = new Web3(library.provider);
    const multicall = new ethereumMulticall.Multicall({ web3Instance: web3, tryAggregate: true });
    const address = account;
    const wEthContractAddress = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    const dd2ContractAddress = "0xb1745657cb84c370dd0db200a626d06b28cc5872";
    const mcContractAddress = "0x9da687e88b0A807e57f1913bCD31D56c49C872c2"

    const contractCallContext = [
      {
        reference: 'balanceWeth',
        contractAddress: wEthContractAddress,
        abi: ERC20,
        calls: [{ reference: 'balanceWeth', methodName: 'balanceOf', methodParameters: [address] }]
      },
      {
        reference: 'balanceDD2',
        contractAddress: dd2ContractAddress,
        abi: DD2,
        calls: [{ reference: 'balanceDD2', methodName: 'balanceOf', methodParameters: [address] }]
      },
      {
        reference: 'DD2Earned',
        contractAddress: mcContractAddress,
        abi: MCABI,
        calls: [{ reference: 'pendingDD2', methodName: 'pendingDD2', methodParameters: [address] }]
      },
      {
        reference: 'userInfo',
        contractAddress: mcContractAddress,
        abi: MCABI,
        calls: [{ reference: 'userInfo', methodName: 'userInfo', methodParameters: [address] }]
      },
      {
        reference: 'allowance',
        contractAddress: wEthContractAddress,
        abi: ERC20,
        calls: [{ reference: 'allowance', methodName: 'allowance', methodParameters: [address, mcContractAddress] }]
      }, {
        reference: 'totalStake',
        contractAddress: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        abi: ERC20,
        calls: [{ reference: 'totalStake', methodName: 'balanceOf', methodParameters: [mcContractAddress] }]
      },
    ];
    const result = await multicall.call(contractCallContext);
    setYourStake(web3.utils.fromWei(result.results.userInfo.callsReturnContext[0].returnValues[0].hex))
    setBlanceWeth(web3.utils.fromWei(result.results.balanceWeth.callsReturnContext[0].returnValues[0].hex))
    setBalanceDD2(web3.utils.fromWei(result.results.balanceDD2.callsReturnContext[0].returnValues[0].hex))
    setDD2earned(web3.utils.fromWei(result.results.DD2Earned.callsReturnContext[0].returnValues[0].hex))
    setTotalStake(web3.utils.fromWei(result.results.totalStake.callsReturnContext[0].returnValues[0].hex))
    isAllowance = web3.utils.fromWei(result.results.allowance.callsReturnContext[0].returnValues[0].hex)
  }

  const deposit = async (amount) => {
    const web3 = new Web3(library.provider); {
      const McContract = new web3.eth.Contract(MCABI, '0x9da687e88b0A807e57f1913bCD31D56c49C872c2');
      await McContract.methods.deposit(web3.utils.toWei(amount)).send({ from: account })
        .then(() => window.location.reload());
      console.log('DEPOSIT SUCCESS');
    };
  }

  const withdraw = async (amount) => {
    const web3 = new Web3(library.provider); {
      const McContract = new web3.eth.Contract(MCABI, '0x9da687e88b0A807e57f1913bCD31D56c49C872c2');
      await McContract.methods.withdraw(web3.utils.toWei(amount)).send({ from: account })
        .then(() => window.location.reload());
      console.log('WITHDRAW SUCCESS');
    };
  }

  const approve = async () => {
    const web3 = new Web3(library.provider);
    const WethContract = new web3.eth.Contract(ERC20, '0xc778417e063141139fce010982780140aa0cd5ab');
    await WethContract.methods.approve("0x9da687e88b0A807e57f1913bCD31D56c49C872c2", web3.utils.toWei('100'))
      .send({ from: account })
      .then(() => setIsNone("none"));
    console.log('APPROVE SUCCESS');
  };

  const harvest = async () => {
    const web3 = new Web3(library.provider);
    console.log(library.provider);
    const McContract = new web3.eth.Contract(MCABI, '0x9da687e88b0A807e57f1913bCD31D56c49C872c2');
    await McContract.methods.deposit(0).send({ from: account })
      .then(() => window.location.reload());
    console.log('HARVEST SUCCESS');
  };

  useEffect(() => {
    if (account) {
      getStaticInfo();
    }
  }, [account]);
  return (
    <div style={{ marginTop: "4rem" }}>
      {
        <div style={{ width: '1280px', margin: '0px auto', border: '1px solid #000', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4>Wallet address: {account} </h4>
            <h4>Balance: {balanceWeth} WETH</h4>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4>Token earned: {dd2earned} DD2</h4>
            <button style={{ padding: '20px' }} onClick={harvest}>Harvest</button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button style={{ display: isNone, padding: '20px 60px' }} onClick={approve}>Approve</button>
            {
              isNone ? <>
                <button style={{ padding: '10px 20px', marginRight: '20px' }} onClick={() => { setModalWithdraw(false); setModalDeposit(true); }}>Deposit</button>
                <button style={{ padding: '10px 20px' }} onClick={() => { setModalDeposit(false); setModalWithdraw(true); }}>WithDraw</button>
              </> :
                <></>
            }
          </div>

          <h4 style={{ textAlign: 'left' }}>Your DD2: {balanceDD2} DD2</h4>
          <h4 style={{ textAlign: 'left' }}>Your stake: {yourStake} WETH</h4>
          <h4 style={{ textAlign: 'left' }}>Total stake: {totalStake} WETH</h4>
        </div>
      }
      <div style={{ marginLeft: "4rem" }}>
        <Modal isOpen={isShowModalDeposit} toggle={() => setModalDeposit(false)}>
          <ModalHeader >Stake</ModalHeader>
          <ModalBody>
            <InputGroup>
              <Input onChange={e => setValueDeposit(e.target.value)} placeholder="Input your amount" type="number" />
            </InputGroup>
            <p>Your WETH: {yourStake} WETH</p>
            <Button onClick={() => deposit(valueDeposit).call()}>Stake</Button>
          </ModalBody>
        </Modal>

        <Modal isOpen={isShowModalWithdraw} toggle={() => setModalWithdraw(false)}>
          <ModalHeader >WithDraw</ModalHeader>
          <ModalBody>
            <InputGroup>
              <Input onChange={e => setValueWithdraw(e.target.value)} placeholder="Input your amount" type="number" />
            </InputGroup>
            <p>Your WETH: {yourStake} WETH</p>
            <Button onClick={() => { withdraw(valueWithdraw).call(); }}>WithDraw</Button>
          </ModalBody>
        </Modal>

      </div>
      <div style={{ width: '1280px', margin: '0px auto', border: '1px solid #000', padding: '20px' }}>
        <TableHistory account={account}></TableHistory>
      </div>
    </div>

  )
}

export default AfterConnect
