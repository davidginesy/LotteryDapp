import Head from 'next/head'
import { useState, useEffect } from 'react'
import { ethers } from "ethers";
import lotteryContract from '../blockchain/lottery'
import 'bulma/css/bulma.css'
import styles from '../styles/Lottery.module.css'

const Lottery = () => {
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [PrizePool, setPrizePool] = useState('')
  const [address, setAddress] = useState(null)
  const [Contract, setContract] = useState(null)
  const [ContractRW, setContractRW] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [EntryFee, setEntryFee] = useState(null)

  useEffect(() => {
    if (Contract){
      getEntryFeeHandler()
      getPrizePoolHandler()
    }
    //if (vmContract && address) getMyDonutCountHandler()
  }, [Contract, address])

  const getPrizePoolHandler = async () => {
      const PrizePool = ethers.utils.formatEther(await Contract.getContractBalance())
      setPrizePool(PrizePool) 
  } 
  const getEntryFeeHandler = async () => {
    const EntryFee = ethers.utils.formatEther(await Contract.EntryFee())
    setEntryFee(EntryFee) 
  } 

  const StartLottery = async () => {
    await ContractRW.StartLottery()
  } 
  const EnterLotteryHandler = async () => {
    try {
      console.log(Contract)
      await signer.sendTransaction({
        to: Contract.address,
        value: ethers.utils.parseEther(EntryFee)
      })
      setSuccessMsg('You have entered the lottery!')
    } catch (error) {
      setError(error.message)
    }
  }

  const connectWalletHandler = async () => {
    /* check if MetaMask is installed */
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        try {

          // A Web3Provider wraps a standard Web3 provider, which is
          // what MetaMask injects as window.ethereum into each page
          const provider = new ethers.providers.Web3Provider(window.ethereum)

          // MetaMask requires requesting permission to connect users accounts
          await provider.send("eth_requestAccounts", []);

          // The MetaMask plugin also allows signing transactions to
          // send ether and pay to change state within the blockchain.
          // For this, you need the account signer...
          const signer = provider.getSigner()

          setProvider(provider)
          setSigner(signer)
          setAddress(await signer.getAddress())          

          /* create local contract copy */
          setContract(lotteryContract(provider))
          setContractRW(lotteryContract(signer))
        } catch(err) {
          setError(err.message)
        }
    } else {
        // meta mask is not installed
        console.log("Please install MetaMask")
    }
  }

  return (
      <div className={styles.main}>
        <Head>
          <title>Lottery App</title>
          <meta name="description" content="A blockchain lottery app" />
        </Head>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
              <div className="navbar-brand">
                <h1>Lottery</h1>
              </div>
              <div className="navbar-end">
                  <button onClick={connectWalletHandler} className="button is-primary">Connect</button>
              </div>
          </div>
        </nav>
        <section>
            <div className="container">
                <h2>Prize Pool: {PrizePool} ETH</h2>
            </div>
            <div className="container">
                <h2>Entry : {EntryFee} ETH</h2>
            </div>
        </section>        
        <section className="mt-5">
            <div className="container">
              <div className="field">
                <label className="label">Buy lottery ticket</label>                
                <button onClick={EnterLotteryHandler} className="button is-primary mt-2">Buy</button>
              </div>
              <div className="field">
                <label className="label">Open</label>                
                <button onClick={StartLottery} className="button is-primary mt-2">Start</button>
              </div>
            </div>
        </section>
        <section>
            <div className="container has-text-danger">
                <p>{error}</p>
            </div>
        </section>
        <section>
            <div className="container has-text-success">
                <p>{successMsg}</p>
            </div>
        </section>
      </div>
  )
}

export default Lottery