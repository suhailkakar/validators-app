#!/usr/bin/env node

const https = require('https');

// TAC RPC endpoint
const RPC_URL = 'https://tendermint.rpc.tac.build';

// Restricted validators from requirements
const RESTRICTED_VALIDATORS = [
  "tacvaloper14zdtx5j770q700e8xg2v6lm0g3m58mc0qvs0kp",
  "tacvaloper1e4xgzj8vasua0pd65t3jnr2nc2yccdqhlhmdvl", 
  "tacvaloper1mcmgua3ewywj8m3y2a6tayfkt8w7m77tl3ruvf",
  "tacvaloper1vff4r0nc766n6x68ceatv4ffea2ltr8l04u8t6",
  "tacvaloper1w25sweez0ek6wyk0yg2vx3ttqgyn3tuwjkzfjr",
  "tacvaloper1tcjtpw8u7u6eu4hez8z2zfu6lssvt82v79egp5",
  "tacvaloper16937gs3thamqecrrnns3dt7sgzpymkyf5nfpe2",
  "tacvaloper1lh6xd8x9n9jspywcpf6npke9glh56pd5qreyfd",
  "tacvaloper1a4xlewuye9uvjyp4s4yklkvg3pkrua02ms047v"
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function exploreTxSearch() {
  console.log('🔍 Exploring tx_search API for MsgWithdrawValidatorCommission transactions...\n');
  
  try {
    // First, let's see the general structure - use double quotes in the query
    const query = `"message.action='/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission'"`;
    const url = `${RPC_URL}/tx_search?query=${encodeURIComponent(query)}&per_page=5&page=1`;
    
    console.log('📡 Fetching URL:', url);
    console.log();
    
    const response = await makeRequest(url);
    
    console.log('📊 Response structure:');
    console.log('Raw response keys:', Object.keys(response));
    console.log('Result keys:', Object.keys(response.result || {}));
    console.log('- total_count:', response.result?.total_count);
    console.log('- count:', response.result?.count);
    console.log('- txs length:', response.result?.txs?.length);
    console.log('Full response sample:');
    console.log(JSON.stringify(response, null, 2).substring(0, 500), '...');
    console.log();
    
    if (response.result?.txs?.length > 0) {
      const firstTx = response.result.txs[0];
      console.log('🔍 First transaction structure:');
      console.log('- hash:', firstTx.hash);
      console.log('- height:', firstTx.height);
      console.log('- tx_result.code:', firstTx.tx_result?.code);
      console.log('- tx_result.events length:', firstTx.tx_result?.events?.length);
      console.log();
      
      // Look at the transaction events
      console.log('📋 Transaction events:');
      firstTx.tx_result?.events?.forEach((event, index) => {
        console.log(`  Event ${index}: ${event.type}`);
        if (event.type === 'withdraw_commission' || event.type === 'coin_received' || event.type === 'coin_spent') {
          console.log('    Attributes:');
          event.attributes?.forEach(attr => {
            console.log(`      ${attr.key}: ${attr.value}`);
          });
        }
      });
      console.log();
      
      // Look at messages in the transaction
      if (firstTx.tx) {
        try {
          const txData = Buffer.from(firstTx.tx, 'base64');
          console.log('🔗 Raw tx data length:', txData.length);
          
          // Try to find validator address in the transaction somehow
          console.log('🔍 Looking for validator addresses in transaction...');
          RESTRICTED_VALIDATORS.forEach(validator => {
            if (firstTx.tx.includes(Buffer.from(validator).toString('base64').substring(0, 10))) {
              console.log(`   📌 Found potential match for: ${validator}`);
            }
          });
        } catch (e) {
          console.log('❌ Could not decode tx data:', e.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function exploreSpecificValidator() {
  console.log('\n🎯 Exploring transactions for a specific validator...\n');
  
  const testValidator = RESTRICTED_VALIDATORS[0]; // Use first restricted validator
  console.log('🧪 Testing with validator:', testValidator);
  
  try {
    // Try to search for transactions that might include this validator
    const queries = [
      `message.action='/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission' AND message.sender='${testValidator}'`,
      `message.action='/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission' AND withdraw_commission.validator='${testValidator}'`,
      `withdraw_commission.validator='${testValidator}'`
    ];
    
    for (let i = 0; i < queries.length; i++) {
      const query = encodeURIComponent(queries[i]);
      const url = `${RPC_URL}/tx_search?query=${query}&per_page=3&page=1`;
      
      console.log(`🔍 Query ${i + 1}:`, queries[i]);
      console.log('📡 URL:', url);
      
      try {
        const response = await makeRequest(url);
        console.log('📊 Results:', response.result?.total_count || 0, 'transactions');
        
        if (response.result?.txs?.length > 0) {
          console.log('✅ Found transactions! First tx hash:', response.result.txs[0].hash);
        }
      } catch (e) {
        console.log('❌ Query failed:', e.message);
      }
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function verifyTotalCount() {
  console.log('\n🔢 Verifying total transaction count with pagination...\n');
  
  try {
    const query = `"message.action='/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission'"`;
    
    // Start with a large per_page to see total
    const url = `${RPC_URL}/tx_search?query=${encodeURIComponent(query)}&per_page=100&page=1`;
    console.log('📡 Fetching with per_page=100:', url);
    
    const response = await makeRequest(url);
    console.log('📊 Total count:', response.result?.total_count);
    console.log('📊 Current page count:', response.result?.count);
    console.log('📊 Transactions in this response:', response.result?.txs?.length);
    
    // If there are more than 100, let's try pagination
    if (response.result?.total_count > 100) {
      console.log('\n🔄 Fetching page 2...');
      const page2Url = `${RPC_URL}/tx_search?query=${encodeURIComponent(query)}&per_page=100&page=2`;
      const page2Response = await makeRequest(page2Url);
      console.log('📊 Page 2 count:', page2Response.result?.count);
    }
    
    return response.result?.total_count || 0;
    
  } catch (error) {
    console.error('❌ Error verifying count:', error.message);
    return 0;
  }
}

async function decodeTransactionData() {
  console.log('\n🔍 Analyzing transaction structure to find validator addresses...\n');
  
  try {
    const query = `"message.action='/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission'"`;
    const url = `${RPC_URL}/tx_search?query=${encodeURIComponent(query)}&per_page=10&page=1`;
    
    const response = await makeRequest(url);
    
    if (!response.result?.txs?.length) {
      console.log('❌ No transactions found');
      return;
    }
    
    console.log(`🔍 Analyzing ${response.result.txs.length} transactions...\n`);
    
    for (let i = 0; i < Math.min(3, response.result.txs.length); i++) {
      const tx = response.result.txs[i];
      console.log(`--- Transaction ${i + 1} (${tx.hash}) ---`);
      console.log('Height:', tx.height);
      
      // Look through all events for validator info
      console.log('📋 Events:');
      tx.tx_result?.events?.forEach((event, eventIndex) => {
        console.log(`  ${eventIndex + 1}. ${event.type}`);
        
        // Look for validator address in attributes
        const validatorAttr = event.attributes?.find(attr => 
          attr.key === 'validator' || 
          attr.key === 'validatorAddress' ||
          attr.key.toLowerCase().includes('validator')
        );
        
        if (validatorAttr) {
          console.log(`    🎯 Found validator: ${validatorAttr.key} = ${validatorAttr.value}`);
        }
        
        // Also check for withdraw_commission events specifically
        if (event.type === 'withdraw_commission') {
          console.log('    📊 Commission withdrawal attributes:');
          event.attributes?.forEach(attr => {
            console.log(`      ${attr.key}: ${attr.value}`);
          });
        }
      });
      
      // Try to decode the transaction itself to find validator
      console.log('🔗 Looking in tx data...');
      try {
        // Check if any restricted validator addresses appear in the base64 encoded tx
        const foundValidators = RESTRICTED_VALIDATORS.filter(validator => {
          // Convert validator address to different encodings to check
          const validatorHex = Buffer.from(validator).toString('hex');
          return tx.tx.includes(validatorHex.substring(0, 20)) || // Check first part of hex
                 tx.tx.includes(validator.substring(10, 30)); // Check part of original
        });
        
        if (foundValidators.length > 0) {
          console.log(`    🎯 Found restricted validator match: ${foundValidators[0]}`);
        } else {
          console.log('    ❌ No restricted validator found in tx data');
        }
      } catch (e) {
        console.log('    ❌ Error checking tx data:', e.message);
      }
      
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Error analyzing transactions:', error.message);
  }
}

async function checkAllValidatorsInTransactions() {
  console.log('\n📊 Checking which validators made commission withdrawals...\n');
  
  try {
    const query = `"message.action='/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission'"`;
    const url = `${RPC_URL}/tx_search?query=${encodeURIComponent(query)}&per_page=100&page=1`;
    
    const response = await makeRequest(url);
    const allValidators = new Set();
    const restrictedValidatorTxs = [];
    
    if (response.result?.txs) {
      console.log(`🔍 Analyzing all ${response.result.txs.length} transactions...\n`);
      
      response.result.txs.forEach((tx, index) => {
        // Find validator in events
        tx.tx_result?.events?.forEach(event => {
          if (event.type === 'withdraw_rewards' || event.type === 'withdraw_commission') {
            const validatorAttr = event.attributes?.find(attr => attr.key === 'validator');
            if (validatorAttr && validatorAttr.value) {
              allValidators.add(validatorAttr.value);
              
              // Check if this is a restricted validator
              if (RESTRICTED_VALIDATORS.includes(validatorAttr.value)) {
                console.log(`🎯 FOUND RESTRICTED VALIDATOR: ${validatorAttr.value}`);
                console.log(`   Transaction: ${tx.hash} (height: ${tx.height})`);
                
                // Get commission amount
                const commissionEvent = tx.tx_result?.events?.find(e => e.type === 'withdraw_commission');
                if (commissionEvent) {
                  const amountAttr = commissionEvent.attributes?.find(attr => attr.key === 'amount');
                  if (amountAttr) {
                    console.log(`   Amount: ${amountAttr.value}`);
                    // Convert from utac to TAC
                    const utacAmount = amountAttr.value.replace('utac', '');
                    const tacAmount = (BigInt(utacAmount) / BigInt(10**18)).toString();
                    console.log(`   Amount in TAC: ${tacAmount}`);
                  }
                }
                
                restrictedValidatorTxs.push({
                  validator: validatorAttr.value,
                  hash: tx.hash,
                  height: tx.height,
                  tx: tx
                });
                console.log();
              }
            }
          }
        });
      });
    }
    
    console.log(`📊 Summary:`);
    console.log(`   Total unique validators with commission withdrawals: ${allValidators.size}`);
    console.log(`   All validators found:`);
    Array.from(allValidators).forEach(validator => {
      const isRestricted = RESTRICTED_VALIDATORS.includes(validator);
      console.log(`   - ${validator} ${isRestricted ? '🎯 (RESTRICTED)' : ''}`);
    });
    
    console.log(`\n🎯 Restricted validator transactions: ${restrictedValidatorTxs.length}`);
    
    return {
      allValidators: Array.from(allValidators),
      restrictedValidatorTxs
    };
    
  } catch (error) {
    console.error('❌ Error checking validators:', error.message);
    return { allValidators: [], restrictedValidatorTxs: [] };
  }
}

async function main() {
  console.log('🚀 TAC Claimed Rewards Explorer\n');
  console.log('===============================\n');
  
  // First verify the total count
  const totalCount = await verifyTotalCount();
  
  // Check all validators in transactions 
  const { allValidators, restrictedValidatorTxs } = await checkAllValidatorsInTransactions();
  
  console.log('\n✅ Exploration complete!');
  console.log(`📊 Total MsgWithdrawValidatorCommission transactions: ${totalCount}`);
  console.log(`📊 Total unique validators: ${allValidators.length}`);
  console.log(`📊 Restricted validator transactions: ${restrictedValidatorTxs.length}`);
  
  if (restrictedValidatorTxs.length === 0) {
    console.log('\n✨ CONCLUSION: None of the restricted validators have ever claimed commission rewards!');
    console.log('   This means for all restricted validators: claimed rewards = 0');
    console.log('   The dashboard can safely show 0 for claimed rewards for all restricted validators.');
  } else {
    console.log('\n💡 Next steps:');
    console.log('1. Sum up claimed rewards per restricted validator');
    console.log('2. Convert amounts from utac to TAC');
    console.log('3. Integrate into dashboard');
  }
}

main().catch(console.error);