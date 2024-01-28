const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "02173469d529dbc6fa1d1c674b7bb95c797f4be669f96967df0111a0a949b95dc2": 100, //privte: c7430fac5c95e7a2078046bbc6ecf0f9cadff436496b858da1f260ae72c705d3
  "031bea05471773038228cbf7aca06ca60e0c7fc0e804d99a939ea217063378fe87": 50, //privte: 24156f00eeb225a3d800f4153993987fa8c4231166758a2f2ff8a624f6620ae5
  "0357608b0e07cc13136029f05dcc23901cb7fdd6dfbd22e40c4c1827a7127342f4": 75, //privte: 2eaeaeb0d04b7b435155e239610a6a50d0e9371d585a7c08afda8ce3a69db0cb
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature, recovery } = req.body;

  if(!signature) res.status(404).send({ message: "signature dont was provide" });
  if(!recovery) res.status(400).send({ message: "recovery dont was provide" });

  try {
    
    const bytes = utf8ToBytes(JSON.stringify({ sender, recipient, amount }));
    const hash = keccak256(bytes);

    const sig = new Uint8Array(signature);

    const publicKey = await secp.recoverPublicKey(hash, sig, recovery);

    if(toHex(publicKey) !== sender){
      res.status(400).send({ message: "signature no is valid" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    console.log(error.message)
  }
  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
