//! CrossShield Risk Interceptor
//! PVM contract (ink!) for AI-powered transaction risk analysis
//! Runs on Polkadot's PVM for fast, trust-minimized risk scoring

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod risk_interceptor {
    use ink::prelude::{string::String, vec::Vec};
    use scale::{Decode, Encode};
    use scale_info::TypeInfo;

    // ─── Types ────────────────────────────────────────────────────────────────

    /// Risk severity levels
    #[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum RiskLevel {
        Low,
        Medium,
        High,
        Critical,
    }

    /// Risk analysis report returned for each transaction
    #[derive(Debug, Clone, Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct RiskReport {
        /// 0–100 risk score (higher = riskier)
        pub score: u8,
        /// Severity level derived from score
        pub level: RiskLevel,
        /// Plain-English summary of what the transaction does and why it's risky
        pub summary: String,
        /// Block number when analysis was performed
        pub analyzed_at: u32,
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    #[ink(storage)]
    pub struct RiskInterceptor {
        /// Contract owner (can register safe contracts)
        owner: AccountId,
        /// Whitelist of known-safe contract addresses
        safe_contracts: Vec<AccountId>,
        /// Risk history per caller: maps AccountId → list of reports
        risk_history: ink::storage::Mapping<AccountId, Vec<RiskReport>>,
        /// Total analyses performed
        analysis_count: u64,
    }

    // ─── Events ───────────────────────────────────────────────────────────────

    #[ink(event)]
    pub struct TransactionAnalyzed {
        #[ink(topic)]
        caller: AccountId,
        score: u8,
        level: RiskLevel,
    }

    #[ink(event)]
    pub struct ContractRegistered {
        #[ink(topic)]
        contract_id: AccountId,
    }

    // ─── Implementation ───────────────────────────────────────────────────────

    impl RiskInterceptor {
        /// Constructor
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                safe_contracts: Vec::new(),
                risk_history: ink::storage::Mapping::default(),
                analysis_count: 0,
            }
        }

        /// Analyze calldata and return a risk report
        /// In production, this would call an off-chain AI worker via an oracle
        /// For the hackathon, uses on-chain heuristics
        #[ink(message)]
        pub fn analyze_calldata(&mut self, calldata: Vec<u8>) -> RiskReport {
            let caller = self.env().caller();
            let score = self.compute_risk_score(&calldata);
            let level = Self::score_to_level(score);
            let summary = Self::generate_summary(score, &level, calldata.len());

            let report = RiskReport {
                score,
                level: level.clone(),
                summary,
                analyzed_at: self.env().block_number(),
            };

            // Store in history
            let mut history = self.risk_history.get(caller).unwrap_or_default();
            history.push(report.clone());
            self.risk_history.insert(caller, &history);
            self.analysis_count += 1;

            self.env().emit_event(TransactionAnalyzed {
                caller,
                score,
                level,
            });

            report
        }

        /// Register a known-safe contract address (owner only)
        #[ink(message)]
        pub fn register_safe_contract(&mut self, contract_id: AccountId) -> bool {
            if self.env().caller() != self.owner {
                return false;
            }
            if !self.safe_contracts.contains(&contract_id) {
                self.safe_contracts.push(contract_id);
                self.env().emit_event(ContractRegistered { contract_id });
                true
            } else {
                false
            }
        }

        /// Get risk history for an account
        #[ink(message)]
        pub fn get_risk_history(&self, account: AccountId) -> Vec<RiskReport> {
            self.risk_history.get(account).unwrap_or_default()
        }

        /// Check if a contract is registered as safe
        #[ink(message)]
        pub fn is_safe_contract(&self, contract_id: AccountId) -> bool {
            self.safe_contracts.contains(&contract_id)
        }

        /// Get total number of analyses performed
        #[ink(message)]
        pub fn get_analysis_count(&self) -> u64 {
            self.analysis_count
        }

        // ─── Internal helpers ──────────────────────────────────────────────

        fn compute_risk_score(&self, calldata: &[u8]) -> u8 {
            let mut score: u16 = 10; // baseline

            // Very short calldata = likely ETH transfer
            if calldata.is_empty() {
                score += 5;
            }

            // Check for common high-risk function selectors
            if calldata.len() >= 4 {
                let selector = &calldata[0..4];
                // approve(address,uint256) = 0x095ea7b3
                if selector == [0x09, 0x5e, 0xa7, 0xb3] {
                    score += 25; // approval of tokens is medium risk
                }
                // transferFrom = 0x23b872dd
                if selector == [0x23, 0xb8, 0x72, 0xdd] {
                    score += 20;
                }
                // selfdestruct patterns
                if selector == [0xff, 0xff, 0xff, 0xff] {
                    score += 60;
                }
            }

            // Long calldata = complex transaction
            if calldata.len() > 500 {
                score += 10;
            }
            if calldata.len() > 2000 {
                score += 15;
            }

            // Cap at 100
            if score > 100 { 100 } else { score as u8 }
        }

        fn score_to_level(score: u8) -> RiskLevel {
            match score {
                0..=24 => RiskLevel::Low,
                25..=49 => RiskLevel::Medium,
                50..=74 => RiskLevel::High,
                _ => RiskLevel::Critical,
            }
        }

        fn generate_summary(score: u8, level: &RiskLevel, data_len: usize) -> String {
            match level {
                RiskLevel::Low => {
                    String::from("Transaction appears safe. Standard operation with no unusual patterns detected.")
                }
                RiskLevel::Medium => {
                    if data_len >= 4 {
                        String::from("Transaction involves token approval or transfer. Verify the recipient and amount before proceeding.")
                    } else {
                        String::from("Moderate risk detected. Review transaction parameters carefully.")
                    }
                }
                RiskLevel::High => {
                    String::from("High risk transaction. Complex calldata with multiple operations. Ensure you trust the target contract.")
                }
                RiskLevel::Critical => {
                    let _ = score; // suppress warning
                    String::from("CRITICAL RISK. Transaction matches known malicious patterns. Do not proceed without expert review.")
                }
            }
        }
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_analyze_empty_calldata() {
            let mut contract = RiskInterceptor::new();
            let report = contract.analyze_calldata(vec![]);
            assert!(report.score < 50);
            assert_eq!(report.level, RiskLevel::Low);
        }

        #[ink::test]
        fn test_analyze_approve_selector() {
            let mut contract = RiskInterceptor::new();
            // approve(address,uint256) selector
            let calldata = vec![0x09, 0x5e, 0xa7, 0xb3, 0x00, 0x00, 0x00, 0x00];
            let report = contract.analyze_calldata(calldata);
            assert!(report.score >= 25);
        }

        #[ink::test]
        fn test_register_safe_contract() {
            let mut contract = RiskInterceptor::new();
            let account = AccountId::from([0x01; 32]);
            let result = contract.register_safe_contract(account);
            assert!(result);
            assert!(contract.is_safe_contract(account));
        }

        #[ink::test]
        fn test_risk_history() {
            let mut contract = RiskInterceptor::new();
            contract.analyze_calldata(vec![0x01, 0x02]);
            contract.analyze_calldata(vec![0x03, 0x04]);
            // history is stored under the default caller
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let history = contract.get_risk_history(accounts.alice);
            assert_eq!(history.len(), 2);
        }

        #[ink::test]
        fn test_analysis_count() {
            let mut contract = RiskInterceptor::new();
            assert_eq!(contract.get_analysis_count(), 0);
            contract.analyze_calldata(vec![]);
            assert_eq!(contract.get_analysis_count(), 1);
        }
    }
}
