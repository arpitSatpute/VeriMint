import React, { useState } from 'react';
import { Shield, Lock, MessageSquare, Key, AlertTriangle, CheckCircle, ExternalLink, Eye, EyeOff, Copy, Check } from 'lucide-react';

const SecurityGuide = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text: string, index: any) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sections = {
    overview: {
      title: "Security Overview",
      icon: Shield,
      content: [
        {
          title: "Current Security Gaps",
          type: "warning",
          items: [
            "Delivery addresses are hashed but merchant needs plaintext for shipping",
            "No secure communication channel between merchant and buyer",
            "Merchant's contact info not encrypted or hidden",
            "No verification mechanism for delivery updates",
            "Potential privacy leaks through on-chain data"
          ]
        },
        {
          title: "Recommended Security Layers",
          type: "success",
          items: [
            "End-to-End Encrypted Messaging (E2EE)",
            "Zero-Knowledge Proof Address Verification",
            "Decentralized Identity (DID) System",
            "Time-Locked Communication Windows",
            "Reputation System with Privacy Preservation"
          ]
        }
      ]
    },
    encryption: {
      title: "Encryption Solutions",
      icon: Lock,
      content: [
        {
          title: "1. XMTP Protocol Integration",
          description: "Decentralized messaging protocol using wallet addresses",
          code: `// Install XMTP
npm install @xmtp/xmtp-js

// Implementation
import { Client } from '@xmtp/xmtp-js';

const initXMTP = async (signer) => {
  const xmtp = await Client.create(signer, { 
    env: 'production' 
  });
  return xmtp;
};

const sendMessage = async (xmtp, recipientAddress, message) => {
  const conversation = await xmtp.conversations.newConversation(
    recipientAddress
  );
  await conversation.send(message);
};`,
          benefits: [
            "E2E encrypted by default",
            "Uses wallet addresses (no email/phone needed)",
            "Messages stored on decentralized network",
            "No central server to compromise"
          ]
        },
        {
          title: "2. Lit Protocol for Access Control",
          description: "Decrypt delivery info only when conditions met",
          code: `// Install Lit Protocol
npm install @lit-protocol/lit-node-client

// Encrypt delivery address
const encryptDeliveryAddress = async (address, orderId) => {
  const accessControlConditions = [
    {
      contractAddress: ESCROW_ADDRESS,
      method: 'isFunded',
      parameters: [orderId],
      returnValueTest: {
        comparator: '=',
        value: 'true'
      }
    }
  ];

  const { ciphertext, dataToEncryptHash } = 
    await LitJsSdk.encryptString(address);

  return { 
    ciphertext, 
    dataToEncryptHash, 
    accessControlConditions 
  };
};`,
          benefits: [
            "Merchant can only decrypt after order funded",
            "Automatic access revocation after delivery",
            "No trusted third party needed",
            "On-chain condition verification"
          ]
        }
      ]
    },
    zkProof: {
      title: "Zero-Knowledge Proofs",
      icon: Eye,
      content: [
        {
          title: "ZK Address Verification",
          description: "Prove delivery location validity without revealing address",
          code: `// Using Semaphore Protocol
npm install @semaphore-protocol/identity @semaphore-protocol/proof

// Generate ZK proof of valid address
const generateAddressProof = async (address, groupId) => {
  const identity = new Identity(address);
  
  const fullProof = await generateProof(
    identity,
    groupId,
    "delivery-verification",
    {
      zkeyFilePath: "./semaphore.zkey",
      wasmFilePath: "./semaphore.wasm"
    }
  );

  return fullProof;
};

// Merchant verifies without seeing actual address
const verifyAddress = async (proof, publicSignals) => {
  return await verifyProof(proof, publicSignals);
};`,
          benefits: [
            "Merchant verifies deliverability without seeing address",
            "Buyer maintains privacy until necessary",
            "Cryptographic guarantee of validity",
            "Prevents fake address submissions"
          ]
        },
        {
          title: "ZK Range Proofs for Shipping Cost",
          description: "Prove shipping cost is within range without exact amount",
          implementation: [
            "Use zk-SNARKs to prove: 'shipping cost < $50'",
            "Buyer commits to cost range, merchant verifies",
            "Protects pricing strategies of both parties",
            "Prevents location-based price discrimination"
          ]
        }
      ]
    },
    did: {
      title: "Decentralized Identity",
      icon: Key,
      content: [
        {
          title: "Ceramic Network DID Integration",
          description: "Self-sovereign identity for reputation without centralization",
          code: `// Install Ceramic
npm install @ceramicnetwork/http-client dids

// Create DID for user
const createUserDID = async (seed) => {
  const ceramic = new CeramicClient('https://ceramic.network');
  const did = new DID({
    provider: new Ed25519Provider(seed),
    resolver: getResolver()
  });
  
  await did.authenticate();
  ceramic.did = did;
  
  return did;
};

// Store encrypted contact info in Ceramic
const storeContactInfo = async (ceramic, contactInfo) => {
  const encryptedData = await ceramic.did.createJWE(
    contactInfo,
    [recipientDID]
  );
  
  const doc = await ceramic.createDocument('tile', {
    content: encryptedData
  });
  
  return doc.id.toString();
};`,
          benefits: [
            "User controls their own data",
            "Portable reputation across platforms",
            "Selective disclosure of information",
            "No central authority"
          ]
        },
        {
          title: "Verifiable Credentials for Merchants",
          description: "Cryptographic proof of merchant legitimacy",
          implementation: [
            "Issue VCs for verified merchants",
            "Buyers can verify without central registry",
            "Revocable if merchant misbehaves",
            "Privacy-preserving verification"
          ]
        }
      ]
    },
    implementation: {
      title: "Implementation Strategy",
      icon: CheckCircle,
      content: [
        {
          title: "Phase 1: Message Encryption (Week 1-2)",
          steps: [
            "Integrate XMTP for basic messaging",
            "Add message UI in delivery page",
            "Encrypt all communications by default",
            "Test with physical product orders"
          ]
        },
        {
          title: "Phase 2: Address Encryption (Week 3-4)",
          steps: [
            "Implement Lit Protocol access control",
            "Encrypt delivery addresses on-chain",
            "Set decryption conditions (order funded, merchant verified)",
            "Add merchant decryption UI",
            "Time-lock decryption (expires after delivery window)"
          ]
        },
        {
          title: "Phase 3: ZK Proofs (Week 5-6)",
          steps: [
            "Implement ZK address validation circuit",
            "Add proof generation on buyer side",
            "Integrate verification in smart contract",
            "Test with various address formats"
          ]
        },
        {
          title: "Phase 4: DID Integration (Week 7-8)",
          steps: [
            "Set up Ceramic nodes",
            "Create DID documents for users",
            "Implement reputation system",
            "Add verifiable credentials for merchants"
          ]
        }
      ]
    },
    smartContract: {
      title: "Smart Contract Updates",
      icon: Shield,
      content: [
        {
          title: "Enhanced Escrow Contract",
          code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SecureEscrow {
    struct EncryptedDelivery {
        bytes encryptedAddress;      // Lit Protocol encrypted
        bytes32 addressCommitment;   // ZK commitment
        uint256 decryptionDeadline;  // Time-locked access
        bool merchantDecrypted;
        bool buyerRevealed;
    }
    
    mapping(uint256 => EncryptedDelivery) public deliveryData;
    
    // Store encrypted address with access control
    function submitEncryptedAddress(
        uint256 orderId,
        bytes calldata encryptedAddress,
        bytes32 commitment,
        bytes calldata zkProof
    ) external {
        require(verifyZKProof(commitment, zkProof), "Invalid proof");
        
        deliveryData[orderId] = EncryptedDelivery({
            encryptedAddress: encryptedAddress,
            addressCommitment: commitment,
            decryptionDeadline: block.timestamp + 7 days,
            merchantDecrypted: false,
            buyerRevealed: false
        });
    }
    
    // Merchant requests decryption (logged for dispute)
    function requestAddressDecryption(uint256 orderId) 
        external 
        onlyMerchant(orderId) 
    {
        require(!deliveryData[orderId].merchantDecrypted, "Already decrypted");
        require(block.timestamp < deliveryData[orderId].decryptionDeadline, 
            "Decryption expired");
        
        deliveryData[orderId].merchantDecrypted = true;
        emit AddressDecryptionRequested(orderId, msg.sender);
    }
    
    // Verify ZK proof of address validity
    function verifyZKProof(
        bytes32 commitment, 
        bytes calldata proof
    ) internal view returns (bool) {
        // Integrate with ZK verifier contract
        return zkVerifier.verify(proof, commitment);
    }
}`,
          security: [
            "Address encrypted with Lit Protocol",
            "ZK proof verifies validity before storage",
            "Time-locked decryption prevents abuse",
            "All access attempts logged on-chain",
            "Automatic expiration after delivery window"
          ]
        }
      ]
    },
    uiChanges: {
      title: "Frontend Security Features",
      icon: MessageSquare,
      content: [
        {
          title: "Secure Messaging Component",
          code: `// SecureChat.tsx
import { Client } from '@xmtp/xmtp-js';
import { useSigner } from 'wagmi';

const SecureChat = ({ orderId, merchantAddress }) => {
  const { data: signer } = useSigner();
  const [xmtp, setXmtp] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const initChat = async () => {
      const client = await Client.create(signer);
      setXmtp(client);
      
      // Listen for messages
      const conversation = await client.conversations.newConversation(
        merchantAddress
      );
      
      for await (const message of conversation.streamMessages()) {
        setMessages(prev => [...prev, message]);
      }
    };
    
    if (signer) initChat();
  }, [signer]);

  const sendMessage = async (text) => {
    const conversation = await xmtp.conversations.newConversation(
      merchantAddress
    );
    await conversation.send(text);
  };

  return (
    <div className="encrypted-chat">
      <div className="security-badge">
        <Lock className="w-4 h-4" />
        <span>End-to-End Encrypted</span>
      </div>
      {/* Chat UI */}
    </div>
  );
};`,
          features: [
            "E2E encrypted message display",
            "Security indicator badge",
            "Message delivery confirmation",
            "Auto-delete after delivery",
            "Screenshot prevention (where possible)"
          ]
        },
        {
          title: "Address Reveal UI",
          code: `const AddressReveal = ({ orderId }) => {
  const [revealed, setRevealed] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const revealAddress = async () => {
    setDecrypting(true);
    try {
      // Request decryption from Lit Protocol
      const decryptedAddress = await litClient.decrypt({
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        chain: 'ethereum'
      });
      
      setRevealed(decryptedAddress);
      
      // Log access on-chain
      await escrowContract.requestAddressDecryption(orderId);
    } catch (error) {
      alert('Decryption failed: ' + error.message);
    } finally {
      setDecrypting(false);
    }
  };

  return (
    <div className="address-reveal">
      {!revealed ? (
        <button onClick={revealAddress} disabled={decrypting}>
          {decrypting ? 'Decrypting...' : 'Reveal Address'}
        </button>
      ) : (
        <div className="revealed-address">
          {revealed}
          <AlertTriangle className="w-4 h-4" />
          <span>This access was logged on-chain</span>
        </div>
      )}
    </div>
  );
};`
        }
      ]
    },
    bestPractices: {
      title: "Security Best Practices",
      icon: AlertTriangle,
      content: [
        {
          title: "For Buyers",
          practices: [
            "Never share delivery address in plain text outside encrypted channels",
            "Verify merchant's DID before revealing sensitive info",
            "Use temporary/forwardable addresses when possible",
            "Enable notification for any address decryption attempts",
            "Report suspicious merchant behavior immediately"
          ]
        },
        {
          title: "For Merchants",
          practices: [
            "Only decrypt addresses when ready to ship",
            "Delete plaintext addresses after shipping label created",
            "Never store decrypted addresses in databases",
            "Use encrypted note-taking if address must be stored temporarily",
            "Verify order authenticity before processing"
          ]
        },
        {
          title: "Smart Contract Security",
          practices: [
            "Implement access control on all sensitive functions",
            "Add rate limiting for decryption requests",
            "Emit events for all sensitive operations",
            "Include emergency pause functionality",
            "Regular security audits by certified firms"
          ]
        },
        {
          title: "Communication Guidelines",
          practices: [
            "Use only XMTP or approved encrypted channels",
            "Never request sensitive info through external apps",
            "Implement auto-delete for sensitive messages",
            "Add watermarks to prevent screenshot sharing",
            "Require re-authentication for sensitive actions"
          ]
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VeriMint Security Guide
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Comprehensive security measures for merchant-buyer communication during delivery
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(sections).map(([key, section]: [string, any]) => {
            const Icon = section.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {(sections as any)[activeTab].content.map((item: any, index: number) => (
            <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              {item.title && (
                <h3 className="text-xl font-semibold mb-4 text-blue-400">
                  {item.title}
                </h3>
              )}
              
              {item.description && (
                <p className="text-gray-400 mb-4">{item.description}</p>
              )}

              {item.type === 'warning' && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
                  <div className="flex gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-red-400">Security Gaps</span>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {item.items.map((point: string, i: number) => (
                      <li key={i} className="text-gray-300">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.type === 'success' && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 mb-4">
                  <div className="flex gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-green-400">Solutions</span>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {item.items.map((point: string, i: number) => (
                      <li key={i} className="text-gray-300">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.code && (
                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(item.code, index)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto text-sm border border-gray-800 mb-4">
                    <code className="text-gray-300">{item.code}</code>
                  </pre>
                </div>
              )}

              {item.benefits && (
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2 text-purple-400">Benefits:</h4>
                  <ul className="space-y-1">
                    {item.benefits.map((benefit: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.implementation && (
                <div className="space-y-2">
                  {item.implementation.map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="text-blue-400 font-semibold">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.steps && (
                <ol className="space-y-3">
                  {item.steps.map((step: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {i + 1}
                      </span>
                      <span className="text-gray-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              {item.security && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Security Features:
                  </h4>
                  <ul className="space-y-1">
                    {item.security.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400">→</span>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.features && (
                <ul className="space-y-2">
                  {item.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.practices && (
                <ul className="space-y-2">
                  {item.practices.map((practice: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold flex-shrink-0 mt-1">✓</span>
                      <span className="text-gray-300">{practice}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 p-6 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex gap-3 items-start">
            <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Next Steps</h4>
              <p className="text-gray-300 mb-3">
                Implement these security measures progressively, starting with XMTP messaging and Lit Protocol encryption. 
                Each layer adds significant protection while maintaining decentralization.
              </p>
              <div className="flex gap-4 text-sm">
                <a href="https://xmtp.org/docs" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                  XMTP Docs <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://developer.litprotocol.com" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                  Lit Protocol <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://developers.ceramic.network" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                  Ceramic Network <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityGuide;