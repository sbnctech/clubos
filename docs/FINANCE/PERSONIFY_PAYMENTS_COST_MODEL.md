# Personify Payments Cost Model

Analysis of payment processing costs for SBNC via Wild Apricot's Personify Payments.

---

## Fee Structure

Personify Payments is Wild Apricot's integrated payment processor (formerly AffiniPay).

### Published Fee Rates

| Card Type | Percentage | Flat Fee | Total Formula |
|-----------|------------|----------|---------------|
| Standard (Visa/MC/Discover) | 2.9% | $0.30 | amount * 0.029 + $0.30 |
| American Express | 3.5% | $0.30 | amount * 0.035 + $0.30 |

### Fee Behavior

- Fees are deducted from each transaction before deposit
- Monthly settlement (fees withdrawn in arrears)
- Merchant (SBNC) pays all processing fees
- No Wild Apricot PSSF (Payment System Service Fee) when using Personify
- Note: WA charges 20% PSSF when using PayPal or external processors

---

## Data Sources

### What Is Pulled from WA API

The analysis script (`scripts/finance/wa_personify_payments_analyze.ts`) fetches:

1. **Invoices** (`/accounts/{id}/invoices`)
   - Invoice ID, document number, date
   - Contact reference
   - Order type (membership, event, donation, etc.)
   - Value, paid amount, outstanding balance
   - Status (Paid, Unpaid, PartiallyPaid, Cancelled, Refunded)

2. **Payments** (`/accounts/{id}/payments`)
   - Payment ID, amount, date
   - Tender type (CreditCard, Check, Cash, etc.)
   - Associated contact

### What Is Inferred (Not Directly Available)

| Data Point | Source | Method |
|------------|--------|--------|
| Transaction fees | Calculated | Published rate applied to gross |
| Card type (Visa/MC/AmEx) | Not available | Assumed standard rate |
| Per-transaction fee breakdown | Not available | Calculated from totals |
| Actual settled amounts | Not available | Gross minus calculated fee |

---

## Fee Calculation Method

### Step 1: Identify Credit Card Transactions

Filter payments where `Tender` indicates credit card:
- "CreditCard"
- "OnlinePayment"
- Any tender containing "credit" or "card"

Exclude:
- Check
- Cash
- ACH/EFT
- Other manual payment methods

### Step 2: Apply Standard Rate

For each credit card transaction:

```
fee = (amount * 0.029) + 0.30
```

Note: AmEx rate (3.5%) cannot be applied because WA API does not expose card type.

### Step 3: Aggregate

```
total_fees = sum(individual_fees)
effective_rate = total_fees / total_gross
```

### Step 4: Annualize

```
annual_estimate = (period_fees / days_in_period) * 365
```

---

## Sample Output

```
FEE ANALYSIS (Credit Card Transactions Only)
----------------------------------------------------------------------
  Transaction Count:    247
  Total Gross:          $24,750.00
  Estimated Fees:       $791.55
  Net After Fees:       $23,958.45
  Avg Transaction:      $100.20
  Effective Rate:       3.20%

ANNUALIZED ESTIMATES
----------------------------------------------------------------------
  Annual Gross:         $24,750.00
  Annual Fees:          $791.55
  Annual Net:           $23,958.45
```

---

## Why This Method Is Trustworthy

### Data Integrity

1. **Source of truth**: Data comes directly from WA API, not manual exports
2. **Pagination handled**: Script fetches all records, not limited samples
3. **Date filtering**: Explicit date range prevents accidental inclusion of old data

### Fee Accuracy

1. **Published rates**: Uses Personify's documented fee structure
2. **Conservative assumption**: Standard rate applied to all cards
   - Understates fees if AmEx usage is significant
   - AmEx typically represents 5-15% of card volume
3. **Verifiable calculation**: Fee formula is transparent and auditable

### Limitations Acknowledged

1. **No card type data**: WA API does not expose Visa vs AmEx
2. **Refund handling**: Refunded transactions may still have incurred fees
3. **Rate changes**: Analysis uses current published rates
4. **Chargebacks**: Not visible in API data

---

## Comparison to Alternative Methods

| Method | Pros | Cons |
|--------|------|------|
| **API Analysis (this script)** | Programmatic, repeatable, transparent | No card type, no actual fee data |
| **Bank statement reconciliation** | Shows actual deposited amounts | Manual, time-consuming |
| **WA financial reports** | Official WA summary | May aggregate differently |
| **Personify merchant dashboard** | Shows actual fees | Requires separate login, manual export |

---

## Running the Analysis

### Prerequisites

```bash
# Required environment variables
export WA_API_KEY="your-api-key"
export WA_ACCOUNT_ID="your-account-id"
```

### Basic Usage

```bash
# Analyze last 12 months
npx tsx scripts/finance/wa_personify_payments_analyze.ts

# Specific date range
npx tsx scripts/finance/wa_personify_payments_analyze.ts --from 2024-01-01 --to 2024-12-31

# JSON output only
npx tsx scripts/finance/wa_personify_payments_analyze.ts --json
```

### Output Files

The script produces:
- Console-readable summary table
- JSON object with full breakdown

---

## Confidence Assessment

| Aspect | Confidence | Notes |
|--------|------------|-------|
| Gross transaction volume | High | Direct from API |
| Transaction count | High | Direct from API |
| Fee percentage applied | High | Published rates |
| Fee estimation accuracy | Medium | No card type, no refund adjustment |
| Annualized projection | Medium | Assumes consistent transaction patterns |

---

## References

- Wild Apricot API v2.2 documentation
- Personify Payments merchant agreement (fee schedule)
- `src/lib/finance/personify-fees.ts` - Fee calculation module
- `scripts/finance/wa_personify_payments_analyze.ts` - Analysis script
