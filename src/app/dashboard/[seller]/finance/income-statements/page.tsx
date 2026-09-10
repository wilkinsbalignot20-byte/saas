 // src/app/dashboard/[seller]/finance/income-statements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { ArrowLeft, FileText, Download, Wallet, CreditCard, Receipt, RefreshCw, AlertCircle } from 'lucide-react';

export default function SellerIncomeStatementPage() {
  const router = useRouter();
  const pathname = usePathname();

  // Accounting Core Finance States
  const [grossSales, setGrossSales] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [gatewayFee, setGatewayFee] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAccountingLedger = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 1. IDENTITY MATRIX EXTRACTION: Kunin ang store id na pag-aari ng merchant
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        // 2. GROSS SALES AGGREGATION: Hahatakin ang sum ng lahat ng completed order transaction totals
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('store_id', storeData.id)
          .eq('status', 'completed');

        if (ordersError) throw ordersError;

        if (orders) {
          const totalGross = orders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
          
          // 3. AUTOMATED ACCOUNTING CALCULATIONS (Tinanggal ang lahat ng hardcoded text):
          const calculatedPlatformFee = totalGross * 0.02; // Saktong 2% SaaS platform fee
          // PayMongo sample estimation logic layout: 2% flat gateway processing constraint
          const calculatedGatewayFee = totalGross > 0 ? (totalGross * 0.01 + 10) : 0; 
          const calculatedNet = totalGross - (calculatedPlatformFee + calculatedGatewayFee);

          setGrossSales(totalGross);
          setPlatformFee(calculatedPlatformFee);
          setGatewayFee(calculatedGatewayFee);
          setNetIncome(calculatedNet);
        }

      } catch (err: any) {
        console.error('Error compiling accounting ledger matrix:', err.message);
        setErrorMessage(err.err || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountingLedger();
  }, [router]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Compiling accounting ledger statement...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 HEADER SECTION WITH DYNAMIC FINANCE TABS */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/seller/finance')} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Back to Finance</span>
          </button>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Income Statement Summary</h1>
          <p className="text-sm text-ink/50">Platform gross revenue margin breakdowns and automated SaaS commission fee structures ledger.</p>
        </div>
        
        {/* SUB-FOLDER SEGMENTED CONTROLS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-ink/5 rounded-xl w-max max-w-full text-xs font-semibold">
          <button 
            onClick={() => router.push('/seller/finance')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname === '/seller/finance' ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <Receipt size={14} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => router.push('/seller/finance/withdraw')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname.includes('/withdraw') ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <CreditCard size={14} />
            <span>Withdrawal</span>
          </button>
          <button 
            onClick={() => router.push('/seller/finance/income-statements')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname.includes('/income-statements') ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <FileText size={14} />
            <span>Income Statements</span>
          </button>
        </div>
      </div>

      {/* ERROR HANDLER LOG NOTIFIER */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* ACCOUNTING LEDGER SHEET */}
      <div className="max-w-2xl bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Ledger Header */}
        <div className="bg-gray-50 border-b border-ink/5 p-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink/40 uppercase tracking-wider font-mono select-none">Statement Period: Current Month</span>
          <button 
            onClick={() => alert('Generating system spreadsheet CSV record export layer...')}
            className="inline-flex items-center gap-1.5 border border-ink/10 bg-white text-ink font-semibold px-3 py-1.5 rounded-xl text-xs hover:bg-ink/5 transition active:scale-95 cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Ledger Core Matrix */}
        <div className="p-6 space-y-4 font-mono text-xs divide-y divide-ink/5">
          <div className="flex justify-between text-ink/40 pb-2 uppercase text-[10px] font-bold font-sans tracking-wide select-none">
            <span>Financial Metric Description</span> 
            <span>Value Amount</span>
          </div>
          
          <div className="flex justify-between pt-4 text-ink font-medium">
            <span>Gross Store Sales volume:</span> 
            {/* INAYOS: Dynamic gross sales accumulator render */}
            <span className="font-bold text-ink">₱{grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          
          {/* INAYOS: Diretsong text-coral Tailwind utility class controls */}
          <div className="flex justify-between pt-4 text-coral font-medium">
            <span>(-) SaaS platform rental fee (2%):</span> 
            {/* INAYOS: Dynamic mathematical platform fee extraction deduction cells */}
            <span>-₱{platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex justify-between pt-4 text-coral font-medium">
            <span>(-) PayMongo gateway handling fee:</span> 
            {/* INAYOS: Dynamic estimated gateway handling fees */}
            <span>-₱{gatewayFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          
          {/* Final Calculated Net Row */}
          <div className="flex justify-between pt-4 text-ink font-bold bg-gray-50 border border-ink/5 -mx-6 px-6 py-4 mt-2">
            <span className="font-sans text-sm font-bold flex items-center gap-1.5 select-none">
              {/* INAYOS: Diretsong text-teal Tailwind class design parameters */}
              <Wallet size={15} className="text-teal" />
              <span>Net Merchant Income:</span>
            </span> 
            {/* INAYOS: Dynamic net ledger results representation */}
            <span className="text-teal font-black text-sm tracking-tight">
              ₱{netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>

    </main>
  );
}
