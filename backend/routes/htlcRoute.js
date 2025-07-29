const express = require('express');
const { generateSecret } = require('../controllers/generate');
const { ethHTLC, scrollHTLC } = require('../controllers/relayer');
const { Contract, ethers } = require('ethers');
const router  = express.Router();

router.get('/', (req, res) =>{
    res.send('this is bacjend');
});
router.post('/generate', (req, res) =>{
    const {hash} = generateSecret();
    res.json( {hash});//fly to frontend
});
router.post('/lock', async (req, res) =>{
    const { receiver, hashlock, timelock, amount, chain } = req.body;
    try {
        let contract;
        if (chain === "eth") {
            contract = ethHTLC;
        } else if (chain === "scroll"){
            contract = scrollHTLC;
        } else {
            res.status(400).json({error: "Unsopported chain"});
        }
        const bytesHashlock = hashlock.startsWith("0x") ? hashlock : "0x" + hashlock;
        const txn = await contract.createSwap(receiver, bytesHashlock, timelock, {value: ethers.parseEther(amount)});
        await txn.wait();
        res.json({ status: "locked", txnHash: txn.hash})

        // await txn.wait();
        // res.json({ status: "locked", txnHash: txn.hash})
    } catch (err){
        console.error(err);
        return res.status(500).json({error: "Lock failed", details: err.message});
    }
    //use the secret and private wallet to lock tokens in the htlc
});

router.post('/withdraw', (req, res) =>{
    const { swapId, secret } = req.body;
});
router.post('/refund', (req, res) =>{
    res.send('timelock expired')
});

module.exports = router;