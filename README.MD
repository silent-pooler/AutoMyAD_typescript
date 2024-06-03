# Airdrop Bot

Automated bot to farm L2 airdrops in TypeScript, Scroll version.
Initially built with the ethers.js library, then moved to viem.

## Installation

To install the project, run the following commands:

```bash
git clone https://github.com/mo7tr/AutoMyAD_typescript.git
cd AutoMyAD_typescript
yarn install
```

## Usage

### Using `env-enc`

https://www.npmjs.com/package/@chainlink/env-enc

For security reasons, two seeds and 15 wallets on each are used.

Define seed 1 and 2 for 30 accounts (15 + 15):

Command + Description:

```bash
yarn add --dev env-enc              # Adds 'env-enc' as a development dependency
npx env-enc set-pw                  # Sets the password for 'env-enc'
npx env-enc set                     # Sets an environment variable
npx env-enc view                    # Displays all environment variables
npx env-enc remove                  # Removes a specific environment variable
npx env-enc remove-all              # Removes all environment variables
```

A `.env.enc` file will be created when initializing the variables.

## Automation

Once wallets are filled with some ETH (see constants/constants.ts and the TRANSACTION_PARAMETERS constant to get an idea of the amount and customize it for yourself):

```bash
yarn ts-node index.ts
```

Currently, the only available functions are the ability to swap USDT and USDC to ETH and vice versa.

## Built-in Modules

### Display ETH Balance

To display balances of each wallets in ETH:

```bash
yarn ts-node built-in_modules/eth_balances.ts --help

yarn ts-node built-in_modules/eth_balances.ts NETWORK (e.g., mainnet, scroll)
```

### Display Token Balance

To display balances of each wallets in token:

```bash
yarn ts-node built-in_modules/tokens_balances.ts --help

ts-node built-in_modules/tokens_balances.ts NETWORK TOKEN (e.g., scroll USDT, mainnet USDC, ...)
```

### Swap Tokens to ETH on L2

To swap tokens to ETH on the L2 network on each wallets randomly in order and time:

```bash
yarn ts-node built-in_modules/swap_tokens_to_ETH_L2.ts --help

yarn ts-node built-in_modules/swap_tokens_to_ETH_L2.ts TOKEN (e.g., USDT, USDC)
```

## Features

Main features:

- Swap USDT and USDC to ETH
- Swap ETH to USDT and USDC
- Built-in modules to keep track:
  - Fetch balances on L2 and Mainnet
  - Sell USDT and/or USDC to ETH
- Random wallet order
- Random time transaction execution

## Contributing

To contribute to this project, follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add an amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

No license, every contribution appreciated, It's you and I against the VC!

## Authors

- **mo7tr** - _Creator_ - [mo7tr](https://github.com/mo7tr)
