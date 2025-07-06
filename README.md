
# Digital Signature QR

A modern web application for securely creating and verifying digital signatures for text and PDF documents, embedded into a QR Code.

---

## Description

In the digital era, ensuring the authenticity and integrity of documents is crucial. This application provides a simple yet powerful solution for digitally signing data. Instead of visually signing a document, it uses cryptographic principles to generate a "fingerprint" (hash) of the data or file, signs it with a private key, and embeds everything into a shareable and verifiable QR code.

---

##  Key Features

### Two Signing Modes:

- **Text**: Sign messages, JSON data, or any plain text directly.
- **File**: Upload a PDF file to generate a secure hash, then sign the hash.

### Private Key Generation:

- Automatically generates a random private key for the signing process.

### Smart Verification:

- Upload a QR code to extract the embedded signature data.
- If the QR code refers to a file, the app will ask for the original file to compare its hash.
- Displays a clear status: **Success**, **Failure**, or **Content Modified**.

### Client-Side Security:

- All cryptographic processes (hashing, signing) occur entirely in the user's browser.
- No data or keys are sent to the server.

### Modern & Responsive UI:

- Clean, intuitive interface accessible on both desktop and mobile devices.

---

##  Technologies Used

- **Framework**: React (with Vite as the build tool)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Core API**: Web Crypto API (SHA-256)
- **QR Code**: `qrcode` and `jsqr` libraries

---

##  Installation and Local Setup

To run this project on your local machine, follow these steps:

### Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Install Dependencies

This project uses npm. Run the following command to install all required packages:

```bash
npm install
```

### Start the Development Server

Once the installation is complete, start the Vite development server:

```bash
npm run dev
```

### Open the Application

Open your browser and visit:

```
http://localhost:5173
```

(or the port displayed in your terminal)

---

##  How Cryptography Works

This app does **not** embed visual signatures into the PDF. The process is far more secure:

- **Hashing**: When you upload a file (e.g., `contract.pdf`), the app reads the entire binary content and converts it into a fixed-length unique string called a hash (using the SHA-256 algorithm). Even a single bit change alters the hash completely.
  
- **Signing**: The hash is combined with your Private Key and hashed again to create a **Digital Signature**.

- **Embedding**: Information (file name, original hash, and digital signature) is converted to JSON and embedded into a QR Code.

- **Verification**: During verification, the process is reversed. The user uploads the QR code and the original file. The app re-computes the file's hash and compares it to the one stored in the QR code. If it matches, the provided key is used to validate the digital signature.

---

##  License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
