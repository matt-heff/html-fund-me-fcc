// import

import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const balanceButton = document.getElementById("getBalanceButton");
const fundButton = document.getElementById("fundButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum != "undefined") {
        try {
            console.log("Metamask exists");
            await window.ethereum.request({ method: "eth_requestAccounts" });
            console.log("Metamask Connected");
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
    } else {
        console.log("No Metamask detected.");
        connectButton.innerHTML = "Please Install Metamask";
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}`);
    if (typeof window.ethereum != "undefined") {
        //we need privduer connection to blockchain
        // also signer /wallet /smonoen iwth gas
        // contract we are interacting with
        // abi and address of contract
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });

            //listen  for the  tx to be mined
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done");
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    //    return new Promise();
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionRececipt) => {
            console.log(
                `Completed with ${transactionRececipt.confirmations} confirmations`
            );
            resolve();
        });
    });
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing .... ");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}
