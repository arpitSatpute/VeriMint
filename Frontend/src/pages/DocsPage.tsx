import React, { useState } from 'react';
import { 
  Shield, Lock, Package, ShoppingCart, Truck, Eye, FileText, 
  CheckCircle, AlertTriangle, Users, Store, Zap, Key,
  BookOpen, Layers, ChevronDown, ChevronRight,
  Upload, List, MapPin
} from 'lucide-react';
import DefaultLayout from '@/layouts/default';

// Type definitions
interface SectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

interface Feature {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  details: {
    [key: string]: string[];
  };
}

interface FeatureCardProps {
  feature: Feature;
}

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'features', label: 'Core Features', icon: Layers },
    { id: 'merchants', label: 'For Merchants', icon: Store },
    { id: 'buyers', label: 'For Buyers', icon: ShoppingCart },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
  ];

  const features = [
    {
      id: 'minting',
      title: 'Product Minting',
      icon: Upload,
      description: 'Create ERC-1155 NFTs for physical and virtual products',
      details: {
        physical: [
          'Identity number & batch tracking',
          'Manufacturing & expiry dates',
          'Weight, dimensions, warranty info',
          'Shipping requirements',
          'Automatic metadata to IPFS'
        ],
        virtual: [
          'Digital art, music, 3D models',
          'Category & rarity attributes',
          'Unlockable content support',
          'Collection management',
          'Instant delivery upon purchase'
        ]
      }
    },
    {
      id: 'listing',
      title: 'Product Listing',
      icon: List,
      description: 'Manage product visibility and availability',
      details: {
        process: [
          'List/unlist products on marketplace',
          'Auto-unlist when sold out',
          'Dynamic pricing control',
          'Supply tracking & reservation',
          'Real-time availability updates'
        ]
      }
    },
    {
      id: 'ordering',
      title: 'Order Management',
      icon: ShoppingCart,
      description: 'Secure escrow-based purchase system',
      details: {
        flow: [
          'Buyer funds escrow with ETH',
          'Supply automatically reserved',
          'Virtual products: instant release',
          'Physical products: delivery tracking',
          'Multi-signature fund release'
        ]
      }
    },
    {
      id: 'delivery',
      title: 'Delivery Tracking',
      icon: Truck,
      description: 'Complete order lifecycle management',
      details: {
        statuses: [
          'Pending → In Transit → Delivered',
          'Merchant updates delivery status',
          'Buyer confirms receipt',
          'Automatic fund release on confirmation',
          'Refund support for cancellations'
        ]
      }
    },
    {
      id: 'encryption',
      title: 'Address Encryption',
      icon: Lock,
      description: 'Lit Protocol powered privacy protection',
      details: {
        protection: [
          'End-to-end encrypted delivery addresses',
          'Time-locked decryption (7 days)',
          'ZK proof commitment verification',
          'On-chain access logging',
          'Automatic deadline expiration'
        ]
      }
    }
  ] as Feature[];

  const Section: React.FC<SectionProps> = ({ id, title, icon: Icon, children }) => (
    <div id={id} className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30">
          <Icon className="w-6 h-6 text-indigo-300" />
        </div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );

  const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
    const isExpanded = expandedFeature === feature.id;
    const Icon = feature.icon;

    return (
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/[0.12] transition-all">
        <button
          onClick={() => setExpandedFeature(isExpanded ? null : feature.id)}
          className="w-full p-6 flex items-start gap-4 text-left"
        >
          <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20 shrink-0">
            <Icon className="w-6 h-6 text-indigo-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-white/90">{feature.title}</h3>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-white/40" />
              ) : (
                <ChevronRight className="w-5 h-5 text-white/40" />
              )}
            </div>
            <p className="text-white/60 text-sm">{feature.description}</p>
          </div>
        </button>
        
        {isExpanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-white/[0.06] pt-4">
            {Object.entries(feature.details).map(([key, items]) => (
              <div key={key}>
                <h4 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <ul className="space-y-2">
                  {(items as string[]).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <img src="/verimint-logo.svg" alt="VeriMint Logo" className="w-16 h-16" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
              VeriMint Documentation
            </h1>
          </div>
          <p className="text-lg text-white/70">
            Complete guide to using the VeriMint decentralized marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <nav className="space-y-1">
              {sections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Overview */}
            <Section id="overview" title="Overview" icon={BookOpen}>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-white/70 leading-relaxed mb-6">
                  VeriMint is a decentralized NFT marketplace built on Ethereum that enables secure trading of both physical and virtual products using ERC-1155 tokens. The platform combines blockchain technology with privacy-preserving mechanisms to create a trustless marketplace for merchants and buyers.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                  {[
                    { icon: Shield, title: 'Privacy-First', desc: 'End-to-end encrypted delivery addresses' },
                    { icon: Lock, title: 'Escrow Protected', desc: 'Secure fund management with smart contracts' },
                    { icon: Zap, title: 'ERC-1155', desc: 'Efficient multi-token standard' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                      <item.icon className="w-8 h-8 text-indigo-400 mb-3" />
                      <h3 className="font-semibold text-white/90 mb-1">{item.title}</h3>
                      <p className="text-sm text-white/60">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6 my-8">
                  <h3 className="text-xl font-semibold text-indigo-300 mb-4">Key Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white/90 mb-2 flex items-center gap-2">
                        <Store className="w-4 h-4 text-purple-400" />
                        For Merchants
                      </h4>
                      <ul className="space-y-2 text-sm text-white/70">
                        <li>• Global reach with low overhead</li>
                        <li>• Automated escrow management</li>
                        <li>• Privacy-protected customer data</li>
                        <li>• No chargebacks or disputes</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white/90 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        For Buyers
                      </h4>
                      <ul className="space-y-2 text-sm text-white/70">
                        <li>• Secure escrow protection</li>
                        <li>• Encrypted delivery addresses</li>
                        <li>• Transparent order tracking</li>
                        <li>• Automatic refund eligibility</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Getting Started */}
            <Section id="getting-started" title="Getting Started" icon={Zap}>
              <div className="space-y-6">
                <p className="text-white/70">
                  Follow these steps to start using VeriMint:
                </p>

                <div className="space-y-4">
                  {[
                    { title: 'Connect Wallet', desc: 'Connect your MetaMask or compatible Web3 wallet to the Sepolia testnet', icon: Key },
                    { title: 'Get Test ETH', desc: 'Obtain Sepolia ETH from faucets to pay for gas fees', icon: Zap },
                    { title: 'Choose Your Role', desc: 'Navigate to Merchant Dashboard to sell, or browse Products to buy', icon: Users },
                    { title: 'Start Trading', desc: 'Mint products, list them, or make your first purchase', icon: ShoppingCart }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                      <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30 flex items-center justify-center">
                        <span className="text-lg font-bold text-indigo-300">{i + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white/90 mb-1">{step.title}</h3>
                        <p className="text-sm text-white/60">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-200 font-semibold mb-1">Testnet Notice</p>
                    <p className="text-xs text-amber-300/80">
                      VeriMint is currently deployed on Sepolia testnet. Use test ETH only. Never send real ETH to testnet addresses.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Core Features */}
            <Section id="features" title="Core Features" icon={Layers}>
              <div className="space-y-4">
                {features.map(feature => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </Section>

            {/* For Merchants */}
            <Section id="merchants" title="For Merchants" icon={Store}>
              <div className="space-y-6">
                <p className="text-white/70">
                  VeriMint empowers merchants to sell products globally with minimal overhead and maximum security.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <Upload className="w-8 h-8 text-indigo-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Minting Products</h3>
                    <ol className="space-y-2 text-sm text-white/70">
                      <li>1. Navigate to Merchant Dashboard</li>
                      <li>2. Click "Mint New NFT"</li>
                      <li>3. Choose Physical or Virtual</li>
                      <li>4. Fill product details & upload image</li>
                      <li>5. Confirm transaction in wallet</li>
                    </ol>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <List className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Managing Listings</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        List products to make them visible
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Auto-unlisting when sold out
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Update pricing anytime
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Track reserved supply
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <Truck className="w-8 h-8 text-rose-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Delivery Updates</h3>
                    <p className="text-sm text-white/60 mb-3">
                      For physical products, update order status:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        <span>Pending → Initial state</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                        <span>In Transit → Item shipped</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <span>Delivered → Confirmed by buyer</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <Lock className="w-8 h-8 text-violet-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Address Decryption</h3>
                    <p className="text-sm text-white/60 mb-3">
                      Access encrypted delivery addresses:
                    </p>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li>• Navigate to order delivery page</li>
                      <li>• Click "Decrypt Delivery Address"</li>
                      <li>• Access valid for 7 days</li>
                      <li>• Delete after creating label</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Merchant Responsibilities
                  </h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400">•</span>
                      <span>Decrypt addresses only when ready to ship</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400">•</span>
                      <span>Update delivery status promptly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400">•</span>
                      <span>Never store decrypted addresses long-term</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400">•</span>
                      <span>Process refunds for legitimate cancellations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* For Buyers */}
            <Section id="buyers" title="For Buyers" icon={ShoppingCart}>
              <div className="space-y-6">
                <p className="text-white/70">
                  Shop securely with escrow protection and encrypted privacy features.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <ShoppingCart className="w-8 h-8 text-indigo-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Making a Purchase</h3>
                    <ol className="space-y-2 text-sm text-white/70">
                      <li>1. Browse products marketplace</li>
                      <li>2. Click product for details</li>
                      <li>3. Review price & supply</li>
                      <li>4. Click "Buy Now"</li>
                      <li>5. Enter quantity & delivery address</li>
                      <li>6. Confirm transaction in wallet</li>
                    </ol>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <MapPin className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Address Encryption</h3>
                    <p className="text-sm text-white/60 mb-3">
                      Your delivery address is protected:
                    </p>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Encrypted with Lit Protocol
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Merchant can only decrypt after funding
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ZK proof commitment verification
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        All access attempts logged on-chain
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <Eye className="w-8 h-8 text-rose-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Tracking Orders</h3>
                    <p className="text-sm text-white/60 mb-3">
                      Monitor your purchases:
                    </p>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li>• View all orders in Orders Dashboard</li>
                      <li>• Check delivery status in real-time</li>
                      <li>• See decryption deadline countdown</li>
                      <li>• Confirm delivery when received</li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Confirming Delivery</h3>
                    <p className="text-sm text-white/60 mb-3">
                      Release funds to merchant:
                    </p>
                    <ol className="space-y-2 text-sm text-white/70">
                      <li>1. Receive & verify product</li>
                      <li>2. Go to order delivery page</li>
                      <li>3. Click "Confirm Delivery"</li>
                      <li>4. Funds released to merchant</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Buyer Protections
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white/90 mb-2 text-sm">Escrow Safety</h4>
                      <ul className="space-y-1 text-xs text-white/70">
                        <li>• Funds held in smart contract</li>
                        <li>• Released only on confirmation</li>
                        <li>• Merchant can't access prematurely</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white/90 mb-2 text-sm">Auto-Refund</h4>
                      <ul className="space-y-1 text-xs text-white/70">
                        <li>• If merchant doesn't decrypt (7 days)</li>
                        <li>• Full refund automatically available</li>
                        <li>• One-click claim process</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Security & Privacy */}
            <Section id="security" title="Security & Privacy" icon={Shield}>
              <div className="space-y-6">
                <p className="text-white/70">
                  VeriMint implements multiple layers of security to protect both merchants and buyers.
                </p>

                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6" />
                    Lit Protocol Integration
                  </h3>
                  <p className="text-white/70 mb-4 text-sm">
                    Delivery addresses are encrypted using Lit Protocol, a decentralized key management network.
                  </p>
                  
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-indigo-300 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 text-sm mb-1">Address Encryption</h4>
                        <p className="text-xs text-white/60">Buyer's address encrypted with Lit Protocol when order is created</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-indigo-300 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 text-sm mb-1">ZK Commitment</h4>
                        <p className="text-xs text-white/60">Zero-knowledge proof commitment hash stored on-chain for verification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-indigo-300 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 text-sm mb-1">Time-Locked Access</h4>
                        <p className="text-xs text-white/60">Merchant can decrypt only within 7-day window after order funding</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-indigo-300 font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 text-sm mb-1">Access Logging</h4>
                        <p className="text-xs text-white/60">All decryption attempts logged on-chain with timestamps</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <Shield className="w-8 h-8 text-emerald-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Data Protection</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        No plaintext addresses stored on-chain
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Encryption keys managed by Lit Network
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Decentralized access control conditions
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Automatic expiration after deadline
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                    <Key className="w-8 h-8 text-violet-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white/90 mb-3">Smart Contract Security</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        ReentrancyGuard on all fund transfers
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        Access control on sensitive functions
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        Event emissions for transparency
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        Emergency withdraw for admin only
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Security Best Practices
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-white/90 mb-2">For Users:</h4>
                      <ul className="space-y-1 text-white/70">
                        <li>• Never share private keys or seed phrases</li>
                        <li>• Verify contract addresses before transactions</li>
                        <li>• Use hardware wallets for large amounts</li>
                        <li>• Double-check transaction details</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white/90 mb-2">For Merchants:</h4>
                      <ul className="space-y-1 text-white/70">
                        <li>• Delete decrypted addresses after use</li>
                        <li>• Never store addresses in unsecured databases</li>
                        <li>• Update delivery status promptly</li>
                        <li>• Process legitimate refunds quickly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </main>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DocsPage;