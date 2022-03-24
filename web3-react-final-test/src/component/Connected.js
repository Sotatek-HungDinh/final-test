
import { useEffect, useState } from "react";
import ERC20 from '../ERC20.json';
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";
import MasterChef from '../MasterChef.json'
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Modal, ModalHeader, ModalBody, InputGroup, Input, ModalFooter } from 'reactstrap';
import History from './History'
const ethereumMulticall = require('ethereum-multicall');

function Connected(props) {
  const { account, } = props
  const { library } = useWeb3React();
  const [wethBalance, setWethBalance] = useState(0);
  const [dd2earned, setDD2earned] = useState(0)
  const [isNone, setIsNone] = useState("")
  const [isShowModalDeposit, setModalDeposit] = useState(false);
  const [isShowModalWithdraw, setModalWithdraw] = useState(false);
  const [valueDeposit, setValueDeposit] = useState(0);
  const [valueWithdraw, setValueWithdraw] = useState(0);
  const [yourStake, setYourStake] = useState(0)
  const [totalStake, setTotalStake] = useState(0)
  let isAllowance = 0

  const getInfo = async () => {
    await multicall()
    if (isAllowance !== 0) setIsNone("none")
  };

  const multicall = async () => {
    const web3 = new Web3(library.provider);
    const multicall = new ethereumMulticall.Multicall({ web3Instance: web3, tryAggregate: true });
    const address = account;
    const wEthContractAddress = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    const mcContractAddress = "0x9da687e88b0A807e57f1913bCD31D56c49C872c2"

    const contractCallContext = [
      {
        reference: 'wethBalance',
        contractAddress: wEthContractAddress,
        abi: ERC20,
        calls: [{ reference: 'wethBalance', methodName: 'balanceOf', methodParameters: [address] }]
      },
      {
        reference: 'DD2Earned',
        contractAddress: mcContractAddress,
        abi: MasterChef,
        calls: [{ reference: 'pendingDD2', methodName: 'pendingDD2', methodParameters: [address] }]
      },
      {
        reference: 'userInfo',
        contractAddress: mcContractAddress,
        abi: MasterChef,
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
    const { results } = await multicall.call(contractCallContext);
    const { userInfo, wethBalance, DD2Earned, totalStake, allowance } = results
    setYourStake(web3.utils.fromWei(userInfo.callsReturnContext[0].returnValues[0].hex))
    setWethBalance(web3.utils.fromWei(wethBalance.callsReturnContext[0].returnValues[0].hex))
    setDD2earned(web3.utils.fromWei(DD2Earned.callsReturnContext[0].returnValues[0].hex))
    setTotalStake(web3.utils.fromWei(totalStake.callsReturnContext[0].returnValues[0].hex))
    isAllowance = web3.utils.fromWei(allowance.callsReturnContext[0].returnValues[0].hex)
  }

  const deposit = async (amount) => {
    const web3 = new Web3(library.provider); {
      const McContract = new web3.eth.Contract(MasterChef, '0x9da687e88b0A807e57f1913bCD31D56c49C872c2');
      await McContract.methods.deposit(web3.utils.toWei(amount)).send({ from: account })
        .then(() => window.location.reload());
    };
  }

  const withdraw = async (amount) => {
    const web3 = new Web3(library.provider); {
      const McContract = new web3.eth.Contract(MasterChef, '0x9da687e88b0A807e57f1913bCD31D56c49C872c2');
      await McContract.methods.withdraw(web3.utils.toWei(amount)).send({ from: account })
        .then(() => window.location.reload());
    };
  }

  const approve = async () => {
    const web3 = new Web3(library.provider);
    const WethContract = new web3.eth.Contract(ERC20, '0xc778417e063141139fce010982780140aa0cd5ab');
    await WethContract.methods.approve("0x9da687e88b0A807e57f1913bCD31D56c49C872c2", web3.utils.toWei('100'))
      .send({ from: account })
      .then(() => setIsNone("none"));
  };

  const harvest = async () => {
    const web3 = new Web3(library.provider);
    console.log(library.provider);
    const McContract = new web3.eth.Contract(MasterChef, '0x9da687e88b0A807e57f1913bCD31D56c49C872c2');
    await McContract.methods.deposit(0).send({ from: account })
      .then(() => window.location.reload());
  };

  useEffect(() => {
    if (account) {
      getInfo();
    }
  }, [account]);
  return (
    <div style={{ marginTop: "4rem" }}>
      {
        <div style={{ width: '600px', margin: '0px auto', border: '1px solid #000', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h6 style={{overflow: "hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", maxWidth:"200px" }}>Wallet address: {account} </h6>
            <h6>Balance: {wethBalance} WETH</h6>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h6 style={{overflow: "hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", maxWidth:"200px", marginTop:"20px" }}>Token DD2 earned: {dd2earned}</h6>
            <button className="btn btn-primary"  onClick={harvest}>Harvest</button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-primary" style={{ display: isNone, padding: '20px 60px' }} onClick={approve}>Approve</button>
            {
              isNone ? <>
                <button className="btn btn-primary" style={{ padding: '10px 20px', marginRight: '20px', marginTop: "10px" }} onClick={() => { setModalWithdraw(false); setModalDeposit(true); }}>Deposit</button>
                <button className="btn btn-primary" style={{ padding: '10px 20px', marginTop: "10px" }} onClick={() => { setModalDeposit(false); setModalWithdraw(true); }}>WithDraw</button>
              </> :
                <></>
            }
          </div>

          <h6 style={{ textAlign: 'left', marginTop:"30px" }}>Your stake: {yourStake} WETH</h6>
          <h6 style={{ textAlign: 'left' }}>Total stake: {totalStake} WETH</h6>
        </div>
      }
      <div >
        <Modal style={{ marginTop: "200px" }} isOpen={isShowModalDeposit} toggle={() => setModalDeposit(false)}>
          <ModalHeader style={{ margin: "auto" }} >Stake</ModalHeader>
          <ModalBody style={{ margin: "auto" }}>
            <InputGroup>
              <Input onChange={e => setValueDeposit(e.target.value)} placeholder="Amount" type="number" />
            </InputGroup>

            <p style={{ marginTop: "20px" }}>Your WETH: {wethBalance} WETH</p>
            <p>Your WETH staked: {yourStake} WETH</p>


          </ModalBody>
          <ModalFooter style={{ margin: "auto" }}>
            <Button className="btn btn-primary" style={{ backgroundColor: "blue" }} onClick={() => deposit(valueDeposit).call()}>Stake</Button>
          </ModalFooter>
        </Modal>

        <Modal style={{ marginTop: "200px" }} isOpen={isShowModalWithdraw} toggle={() => setModalWithdraw(false)}>
          <ModalHeader  style={{ margin: "auto" }} >WithDraw</ModalHeader>
          <ModalBody  style={{ margin: "auto" }}>
            <InputGroup>
              <Input onChange={e => setValueWithdraw(e.target.value)} placeholder="Amount" type="number" />
            </InputGroup>
            <p style={{ marginTop: "20px" }}>Your WETH: {wethBalance} WETH</p>
            <p>Your WETH staked: {yourStake} WETH</p>
          </ModalBody>
          <ModalFooter style={{ margin: "auto" }}>
          <Button className="btn btn-primary" style={{ backgroundColor: "blue" }} onClick={() => withdraw(valueWithdraw).call()}>WithDraw</Button>          </ModalFooter>
        </Modal>

      </div>
      <div style={{ width: '960px', margin: '100px auto', border: '1px solid #000', padding: '20px' }}>
        <History account={account}></History>
      </div>
    </div>

  )
}

export default Connected
