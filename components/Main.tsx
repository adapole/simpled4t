import algosdk, {
	decodeAddress,
	OnApplicationComplete,
	Transaction,
	TransactionSigner,
} from 'algosdk';
import React, { useContext, useEffect, useRef, useState } from 'react';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import { toast } from 'react-toastify';
import {
	apiGetAccountAssets,
	apiGetTxnParams,
	ChainType,
	tealProgramDispence,
	testNetClientalgod,
	testNetClientindexer,
} from '../lib/api';
import WalletConnect from '@walletconnect/client';
import {
	APP_ID,
	DUSD,
	LQT,
	MNG,
	NFTColl,
	USDC,
} from '../lib/helpers/constants';
import { addressContext } from '../lib/helpers/addressContext';
import { encode, decode } from '@msgpack/msgpack';
import { create } from 'ipfs-http-client';
import { formatBigNumWithDecimals } from '../lib/helpers/utilities';
import { IAssetData, SignTxnParams } from '../lib/helpers/types';
import { formatJsonRpcRequest } from '@json-rpc-tools/utils';
import dynamic from 'next/dynamic';
import Faucets from './Faucets';
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import NeosOpen from './NeosOpen';
const ipfs = create({
	host: 'ipfs.infura.io',
	port: 5001,
	protocol: 'https',
});

interface Props {
	returnwallet: (data: any) => Promise<void>;
}
export interface iOption {
	label: string;
	value: string;
}
export interface SignedTxn {
	txID: string;
	blob: Uint8Array;
}
function getUint8Args(amount: number, round: number) {
	return [
		algosdk.encodeUint64(USDC),
		algosdk.encodeUint64(amount),
		algosdk.encodeUint64(round),
		algosdk.encodeUint64(APP_ID),
	];
}
interface iLender {
	xids: Array<number>;
	aamt: number;
	lvr: number;
}
const Main = (props: Props) => {
	const AddressContext = useContext(addressContext);
	const [accounts, setAccounts] = useState<String[]>([]);
	const [chain, setChain] = useState<ChainType>(ChainType.TestNet);

	const address = AddressContext.address;
	const connector = AddressContext.connector;
	const mconnector = AddressContext.mconnector;
	const assets = AddressContext.assets;
	const wc = AddressContext.wc;

	const [openPage, setOpenPage] = useState(1);

	const myAlgoConnect = new MyAlgoConnect({ disableLedgerNano: false });
	const [validRound, setValidRound] = useState(22835051);
	const [fileUrl, updateFileUrl] = useState(``);
	const [hashIpfs, setHashIpfs] = useState('');
	const [selectedAssets, setSelectedAssets] = useState<iOption[]>([
		{
			value: '97931298',
			label: `NENE: 97931298`,
		},
	]);
	const [userInput, setUserInput] = useState<number>(0);
	const [expDay, setExpDay] = useState<number>(0);
	const searchInputRef: any = useRef(null);
	const expiringdayRef: any = useRef(null);
	/* useEffect(() => {
		console.log('render for selectedAssets');

		return () => {
			console.log('return from change, CleanUP');
		};
	}, [selectedAssets]); */
	//let rounds = 10;
	//const amount = 100;
	//const AllowedAmount = amount * 1000000;

	const camtCheck = async () => {
		const accountInfoResponse = await testNetClientindexer
			.lookupAccountAppLocalStates(
				'VUIXZS3FA5A2RMLJCFEQK7EU5AQX5RWWDHIC7ODTNPZ6TSUEFS4LXRVCAQ'
			)
			.applicationID(APP_ID)
			.do();

		if (accountInfoResponse === null) return;

		for (
			let n = 0;
			n < accountInfoResponse['apps-local-states'][0]['key-value'].length;
			n++
		) {
			let kv = accountInfoResponse['apps-local-states'][0]['key-value'];
			let ky = kv[n]['key'];

			// Allowed assets
			if (ky === 'eGlkcw==') {
				// Extract bytes and compare to assetid
				let xids = kv[n]['value']['bytes'];

				let buff = Buffer.from(xids, 'base64');
				let values: Array<number> = [];
				for (let n = 0; n < buff.length; n = n + 8) {
					// Array offset, then check value
					values.push(buff.readUIntBE(n, 8));
				}
				setDisplayLend((prevState) => {
					return { ...prevState, xids: values };
				});
				console.log('xids: ' + values);
			}

			if (ky === 'Y2FtdA==') {
				// Extract bytes and compare to assetid
				let xids = kv[n]['value']['bytes'];

				let buff = Buffer.from(xids, 'base64');
				let values: Array<number> = [];
				for (let n = 0; n < buff.length; n = n + 8) {
					// Array offset, then check value
					values.push(buff.readUIntBE(n, 8));
				}
				console.log('camt: ' + values);
			}
			if (ky === 'bGFtdA==') {
				// Extract bytes and compare to assetid
				let xids = kv[n]['value']['bytes'];

				let buff = Buffer.from(xids, 'base64');
				let values: Array<number> = [];
				for (let n = 0; n < buff.length; n = n + 8) {
					// Array offset, then check value
					values.push(buff.readUIntBE(n, 8));
				}
				console.log('lamt: ' + values);
			}
			//let buff = Buffer.from(ky, 'base64').toString('utf-8');
			//console.log(buff);
		}
		return;
	};

	const checkAppLocalState = async () => {
		const accountInfoResponse = await testNetClientindexer
			.lookupAccountAppLocalStates(address)
			.applicationID(APP_ID)
			.do();
		//console.log(accountInfo['apps-local-states']);
		return accountInfoResponse;
	};
	const [displayLend, setDisplayLend] = useState<iLender>({
		xids: [],
		aamt: 0,
		lvr: 0,
	});
	const checkAllowedAmount = async () => {
		const accountInfoResponse = await checkAppLocalState();
		if (accountInfoResponse === null) return;

		for (
			let n = 0;
			n < accountInfoResponse['apps-local-states'][0]['key-value'].length;
			n++
		) {
			let kv = accountInfoResponse['apps-local-states'][0]['key-value'];
			let ky = kv[n]['key'];

			// Allowed assets
			if (ky === 'eGlkcw==') {
				// Extract bytes and compare to assetid
				let xids = kv[n]['value']['bytes'];

				let buff = Buffer.from(xids, 'base64');
				let values: Array<number> = [];
				for (let n = 0; n < buff.length; n = n + 8) {
					// Array offset, then check value
					values.push(buff.readUIntBE(n, 8));
				}
				setDisplayLend((prevState) => {
					return { ...prevState, xids: values };
				});
				console.log('xids: ' + values);
			}
			// Last valid round, exp
			if (ky === 'bHZy') {
				// Check last valid round, lvr

				let lvr = kv[n]['value']['uint'];

				setDisplayLend((prevState) => {
					return { ...prevState, lvr: lvr };
				});
				console.log('lvr: ' + lvr);
			}
			if (ky === 'YWFtdA==') {
				// Check amount allowed, then check available amount in account
				let aamt = kv[n]['value']['uint'];
				console.log('aamt: ' + aamt);
				setDisplayLend((prevState) => {
					return {
						...prevState,
						aamt: Number(formatBigNumWithDecimals(aamt, 6)),
					};
				});
				// Check assetId balance
			}
		}
		return;
	};
	const logic = async () => {
		console.log('Stake function run!');
		const AllowedAmount: number = userInput * 1000000; //convert()
		let rounds: number = expDay;
		//const lsig = await tealProgramMake(amount);
		let params = await testNetClientalgod.getTransactionParams().do();
		let data =
			'#pragma version 5 \nglobal ZeroAddress \ndup \ndup \ntxn RekeyTo \n== \nassert \ntxn CloseRemainderTo \n== \nassert \ntxn AssetCloseTo \n== \nassert \ntxn Fee \nint 0 \n== \nassert \ntxn XferAsset \narg_0 \nbtoi \n== \nassert \ntxn AssetAmount \narg_1 \nbtoi \n<= \nassert \ntxn LastValid \narg_2 \nbtoi \n<= \nassert \nglobal GroupSize \nint 1 \n- \ndup \ngtxns TypeEnum \nint appl \n== \nassert \ngtxns ApplicationID \narg_3 \nbtoi \n== \nreturn';
		let results = await testNetClientalgod.compile(data).do();
		console.log('Hash = ' + results.hash);
		console.log('Result = ' + results.result);
		let program = new Uint8Array(Buffer.from(results.result, 'base64'));

		if (rounds === 0) rounds = 10;
		let dayToRound = rounds * 17280;
		let exround = params.firstRound + dayToRound;
		setValidRound(exround);

		console.log(AllowedAmount);
		let args = getUint8Args(Number(AllowedAmount), exround);
		let lsiga = new algosdk.LogicSigAccount(program, args);

		const lsig = algosdk.makeLogicSig(program, args);

		const sigkey = decodeAddress(address).publicKey;
		console.log(sigkey);

		lsig.sig = await myAlgoConnect.signLogicSig(lsig.logic, address);
		//const lsigs = await myAlgoConnect.signLogicSig(lsig, result);
		const lsa = lsig.toByte();
		console.log(decode(lsa));
		//const nlsig = { arg: lsig.args, l: lsig.logic, sig: lsig.sig };
		let LogicAcc = { lsig: decode(lsa), sigkey };

		const encoded: Uint8Array = encode(LogicAcc);
		console.log(encoded);

		console.log('LogicSigAccount');
		console.log(decode(lsa));
		console.log('LSA');
		console.log(decode(encoded));

		try {
			toast.info(`Uploading to IPFS...`, {
				position: 'top-right',
				autoClose: false,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				toastId: 'info-ipfs',
			});
			const added = await ipfs.add(encoded);
			const url = `https://ipfs.infura.io/ipfs/${added.path}`;
			updateFileUrl(url);
			//console.log(url);
			const ipfsPath = added.path;
			console.log(added.path);
			console.log(added.cid.toString());

			//console.log(JSON.stringify(chunks));
			setHashIpfs(ipfsPath);

			toast.info(`IPFS hash: ${ipfsPath}`, {
				position: 'top-right',
				autoClose: false,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				toastId: 'info-hash',
			});
			toast.success(`Uploaded to IPFS🎉`, {
				position: 'top-right',
				autoClose: 8000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				toastId: 'success-ipfs',
			});
			//console.log(hashVal);
			/* const chunks = [];
			for await (const chunk of ipfs.cat(
				'QmaAnxTiT7yD7vRY42Doeg9fuW3es3dY6h5QJPb7pTJMs6'
			)) {
				chunks.push(chunk);
			}
			console.log(chunks);
			console.log(decode(chunks[0])); */
		} catch (error) {
			toast.error(`Failed to upload LogicSig`, {
				position: 'top-right',
				autoClose: 8000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				toastId: 'error-sig',
			});
			console.log('Error uploading hash: ', error);
		}
		//const hash = new Uint8Array(Buffer.from('ipfs-here'));
		//setHashVal(hash);
		//writeUserData(result, hash, lsa);
	};
	async function msignTxns(
		defaultAcct: string,
		txns: Transaction[],
		myalgoconnect: MyAlgoConnect
	): Promise<SignedTxn[]> {
		const unsigned = [];
		const signedTxns = [];

		for (const tidx in txns) {
			if (!txns[tidx]) continue;

			const txn = txns[tidx];
			if (algosdk.encodeAddress(txn.from.publicKey) === defaultAcct) {
				signedTxns.push(unsigned.length);
				unsigned.push(txn.toByte());
			} else {
				signedTxns.push({ txID: '', blob: new Uint8Array() });
			}
		}

		const s = await myalgoconnect.signTransaction(unsigned);
		for (let x = 0; x < signedTxns.length; x++) {
			if (typeof signedTxns[x] === 'number') {
				// @ts-expect-error: Let's ignore a compile error here
				signedTxns[x] = s[signedTxns[x]];
			}
		}

		return signedTxns;
	}
	function getSigner(myAlgoConnect: MyAlgoConnect): TransactionSigner {
		//const myAlgoConnect = new MyAlgoConnect();
		return async (txnGroup: Transaction[], indexesToSign: number[]) => {
			const txns = await Promise.resolve(
				//myAlgoConnect.signTransaction(txnGroup.map((txn) => txn.toByte()))
				await msignTxns(address, txnGroup, myAlgoConnect)
			);
			return txns.map((tx) => {
				return tx.blob;
			});
		};
	}

	async function getContractAPI(): Promise<algosdk.ABIContract> {
		const resp = await fetch('/d4t.json');
		return new algosdk.ABIContract(await resp.json());
	}
	async function sign() {
		const suggested = await apiGetTxnParams(ChainType.TestNet);
		const contract = await getContractAPI();
		console.log(contract);
		// Utility function to return an ABIMethod by its name
		function getMethodByName(name: string): algosdk.ABIMethod {
			const m = contract.methods.find((mt: algosdk.ABIMethod) => {
				return mt.name == name;
			});
			if (m === undefined) throw Error('Method undefined: ' + name);
			return m;
		}

		const myAlgoConnect = new MyAlgoConnect();
		// pass myAlgoConnect as exactly the same object for signer
		const signer = getSigner(myAlgoConnect);
		const commonParams = {
			appID: contract.networks['default'].appID,
			sender: address,
			suggestedParams: suggested,
			//OnComplete: algosdk.OnApplicationComplete.OptInOC,
			signer: signer,
		};
		const comp = new algosdk.AtomicTransactionComposer();

		// Simple ABI Calls with standard arguments, return type
		/*comp.addMethodCall({
			method: getMethodByName('test'),
			methodArgs: ['ping'],
			...commonParams,
		});
		 comp.addMethodCall({
			method: getMethodByName('test'),
			methodArgs: ['something'],
			...commonParams,
		}); */

		// This method requires a `transaction` as its second argument. Construct the transaction and pass it in as an argument.
		// The ATC will handle adding it to the group transaction and setting the reference in the application arguments.

		// Create a transaction
		const ptxn = new Transaction({
			from: address,
			to: address,
			amount: 10000,
			note: new Uint8Array(Buffer.from('testing')),
			suggestedParams: suggested,
		}); // algosdk.makePaymentTxnWithSuggestedParamsFromObject
		// Construct TransactionWithSigner
		const tws = {
			txn: ptxn,
			signer: signer,
		};

		// Pass TransactionWithSigner to ATC
		//comp.addTransaction(tws);
		comp.addMethodCall({
			method: getMethodByName('testtxn'),
			methodArgs: [tws, 'something'],
			...commonParams,
		});

		// This is not necessary to call but it is helpful for debugging
		// to see what is being sent to the network
		const g = comp.buildGroup();
		console.log(g);
		try {
			toast.info(`Submitting...`, {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				toastId: 'info-id',
			});
			const result = await comp.execute(testNetClientalgod, 2);
			console.log(result);
			for (const idx in result.methodResults) {
				console.log(result.methodResults[idx]);
			}
			if (result.confirmedRound) {
				toast.success(`Confirmed in round ${result.confirmedRound}`, {
					position: 'top-right',
					autoClose: 10000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					toastId: 'success-id',
				});
			} else {
				toast.error(`Error submitting transaction`, {
					position: 'top-right',
					autoClose: 10000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					toastId: 'error-id',
				});
			}
		} catch (error) {
			toast.error(`Transaction Rejected`, {
				position: 'top-right',
				autoClose: 10000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				toastId: 'error-id',
			});
		}
	}
	// Utility function to return an ABIMethod by its name
	async function getMethodByName(name: string): Promise<algosdk.ABIMethod> {
		const contract = await getContractAPI();
		const m = contract.methods.find((mt: algosdk.ABIMethod) => {
			return mt.name == name;
		});
		if (m === undefined) throw Error('Method undefined: ' + name);
		return m;
	}
	const stake = async () => {
		try {
			const suggested = await apiGetTxnParams(ChainType.TestNet);
			const AllowedAmount: number = userInput * 1000000; //convert()

			//await logic(AllowedAmount, rounds, suggested);

			const ipfsLsaHash = Uint8Array.from(
				Buffer.from(hashIpfs) //'QmNTkHdGbUxnLSBf1jjmAHBQPjMFAvpJmEh8DzU3XYCqbG'
			);
			console.log(ipfsLsaHash);
			const contract = await getContractAPI();

			const getMethod = await getMethodByName('earn');

			const myAlgoConnect = new MyAlgoConnect();
			const signer = getSigner(myAlgoConnect);
			const commonParams = {
				appID: contract.networks['default'].appID,
				sender: address,
				suggestedParams: suggested,
				//OnComplete: algosdk.OnApplicationComplete.OptInOC,
				signer: signer,
			};
			const comp = new algosdk.AtomicTransactionComposer();

			// Create a transaction
			const ptxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
				from: address,
				to: address,
				amount: 0,
				assetIndex: DUSD,
				note: new Uint8Array(Buffer.from('Opt-in to NFT')),
				suggestedParams: suggested,
			}); // algosdk.makePaymentTxnWithSuggestedParamsFromObject
			// Construct TransactionWithSigner
			const tws = {
				txn: ptxn,
				signer: signer,
			};

			const optin = await checkAssetOptin(DUSD, address);
			let AllowedAssets: number[] = [];
			setSelectedAssets((oldArray) => [
				...oldArray,
				{ value: '97931298', label: 'NENE' },
			]);
			//console.log(selectedAssets);
			selectedAssets.forEach((a) => {
				AllowedAssets.push(Number(a.value));
			});
			if (AllowedAssets.length === 0) AllowedAssets = [NFTColl];
			const AllowedAssetsFiltered = AllowedAssets.filter(
				(val, i) => AllowedAssets.indexOf(val) === i
			);

			if (optin == false || optin[0]['deleted']) {
				console.log('Not opted in');
				// Pass TransactionWithSigner to ATC
				comp.addTransaction(tws);
				comp.addMethodCall({
					method: getMethod,
					methodArgs: [
						AllowedAssetsFiltered,
						AllowedAmount,
						validRound,
						ipfsLsaHash,
					],
					...commonParams,
				});
				// This is not necessary to call but it is helpful for debugging
				// to see what is being sent to the network
				const g = comp.buildGroup();
				console.log(g);

				toast.info(`Submitting...`, {
					position: 'top-right',
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					toastId: 'info-id',
				});
				const result = await comp.execute(testNetClientalgod, 2);
				console.log(result);
				for (const idx in result.methodResults) {
					console.log(result.methodResults[idx]);
				}
				if (result.confirmedRound) {
					toast.success(`Confirmed in round ${result.confirmedRound}`, {
						position: 'top-right',
						autoClose: 10000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						toastId: 'success-id',
					});
				} else {
					toast.error(`Error submitting transaction`, {
						position: 'top-right',
						autoClose: 10000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						toastId: 'error-id',
					});
				}

				// Submit the transaction
				return; //await submitTransaction(signedGroup);
			} else if ((optin.length = 1 && !optin[0]['deleted'])) {
				console.log('Already opted in');

				comp.addMethodCall({
					method: getMethod,
					methodArgs: [
						AllowedAssetsFiltered,
						AllowedAmount,
						validRound,
						ipfsLsaHash,
					],
					...commonParams,
				});
				// This is not necessary to call but it is helpful for debugging
				// to see what is being sent to the network
				const g = comp.buildGroup();
				console.log(g);

				toast.info(`Submitting...`, {
					position: 'top-right',
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					toastId: 'info-id',
				});
				const result = await comp.execute(testNetClientalgod, 2);
				console.log(result);
				for (const idx in result.methodResults) {
					console.log(result.methodResults[idx]);
				}
				if (result.confirmedRound) {
					toast.success(`Confirmed in round ${result.confirmedRound}`, {
						position: 'top-right',
						autoClose: 10000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						toastId: 'success-id',
					});
				} else {
					toast.error(`Error submitting transaction`, {
						position: 'top-right',
						autoClose: 10000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						toastId: 'error-id',
					});
				}

				return; //await submitTransaction(signedGroup);
			}
		} catch (error) {
			console.log(error);
			toast.error(`Request Rejected`, {
				position: 'top-right',
				autoClose: 8000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		}
	};
	/**
	 * Returns Uint8array of LogicSig from ipfs, throw error
	 * @param ipfsPath hash string of ipfs path
	 */
	const borrowGetLogic = async (ipfsPath: string): Promise<Uint8Array> => {
		const chunks = [];
		for await (const chunk of ipfs.cat(ipfsPath)) {
			chunks.push(chunk);
		}
		//console.log(chunks);
		//setBorrowLogicSig(chunks[0]);
		return chunks[0];
	};
	async function wcsignATC(collateralamt: number, loanamt: number) {
		const suggested = await apiGetTxnParams(ChainType.TestNet);
		const suggestedParams = await apiGetTxnParams(ChainType.TestNet);
		const contract = await getContractAPI();

		console.log(contract);
		// Utility function to return an ABIMethod by its name
		function getMethodByName(name: string): algosdk.ABIMethod {
			const m = contract.methods.find((mt: algosdk.ABIMethod) => {
				return mt.name == name;
			});
			if (m === undefined) throw Error('Method undefined: ' + name);
			return m;
		}
		const signer = getSignerWC(connector, address);
		suggested.flatFee = true;
		suggested.fee = 4000;
		let acct = algosdk.mnemonicToSecretKey(
			process.env.NEXT_PUBLIC_MEMONIC_VUI as string
		);
		// We initialize the common parameters here, they'll be passed to all the transactions
		// since they happen to be the same
		const commonParams = {
			appID: contract.networks['default'].appID,
			sender: address,
			suggestedParams: suggested,
			onComplete: OnApplicationComplete.NoOpOC,
			signer, //: algosdk.makeBasicAccountTransactionSigner(acct),
		};
		const comp = new algosdk.AtomicTransactionComposer();
		//'QmNU1gEgZKnMAL9gEWdWXAmuaDguUFhbGYqLw4p1iCGrSc' //'QmRY9HMe2fb6HAJhywnTTYQamLxQV9qJbjVeK7Wa314TeR' 'QmdvvuGptFDAoB6Vf9eJcPeQTKi2MjA3AnEv47syNPz6CS'
		const borrowLogic = await borrowGetLogic(
			'QmXJWc7jeSJ7F2Cc4cm6SSYdMnAiCG4M4gfaiQXvDbdAbL' //'QmWFR6jSCaqfxjVK9S3PNNyyCh35kYx5sGgwi7eZAogpD9' //'QmciTBaxmKRF9fHjJP7q83f9nvBPf757ocbyEvTnrMttyM' //'QmdHj2MHo6Evzjif3RhVCoMV2RMqkxvcZqLP946cN77ZEN' //'QmfWfsjuay1tJXJsNNzhZqgTqSj3CtnMGtu7NK3bVtdh6k' //'QmPubkotHM9iArEoRfntSB6VwbYBLz19c1uxmTp4FYJzbk' //'QmaDABqWt3iKso3YjxRRBCj4HJqqeerAvrBeLTMTTz7VzY' //'QmbbDFKzSAbBpbmhn9b31msyMz6vnZ3ZvKW9ebBuUDCyK9' //'QmYoFqC84dd7K5nCu5XGyWGyqDwEs7Aho8j46wqeGRfuJq' //'QmaGYNdQaj2cygMxxDQqJie3vfAJzCa1VBstReKY1ZuYjK'
		);
		console.log(borrowLogic);
		const borrowLogicSig = borrowLogic;
		const addressLogicSig =
			'KLNYAXOWHKBHUKVDDWFOSXNHYDS45M3KJW4HYJ6GOQB4LGAH4LJF57QVZI';
		const amountborrowing = 1000000;
		const xids = [NFTColl];
		const camt = [collateralamt];
		const lamt = [loanamt];
		const USDC = 10458941;
		const DUSD = 84436770;
		const MNG = 84436122;
		const LQT = 84436752;
		/* let lsiga = algosdk.logicSigFromByte(borrowLogicSig);
		console.log(lsiga);
		console.log(lsiga.toByte()); */

		console.log('Logic sig here');
		let lsig = algosdk.LogicSigAccount.fromByte(borrowLogicSig);
		console.log(lsig.verify());
		console.log(lsig.toByte());
		suggestedParams.flatFee = true;
		suggestedParams.fee = 0;
		const ptxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
			from: addressLogicSig, //Lender address
			to: address, //Borrower address
			amount: amountborrowing,
			assetIndex: USDC,
			suggestedParams,
		});

		// Construct TransactionWithSigner
		const tws = {
			txn: ptxn,
			signer: algosdk.makeLogicSigAccountTransactionSigner(lsig),
		};
		comp.addTransaction(tws);
		comp.addMethodCall({
			method: getMethodByName('borrow'),
			methodArgs: [xids, camt, lamt, addressLogicSig, xids[0], DUSD, MNG, LQT],
			...commonParams,
		});
		//const pay_txn = getPayTxn(suggested, sw.getDefaultAccount());

		//comp.addTransaction({ txn: pay_txn, signer: sw.getSigner() });

		// This is not necessary to call but it is helpful for debugging
		// to see what is being sent to the network
		const g = comp.buildGroup();
		console.log(g);
		for (const x in g) {
			console.log(g[x].txn.appArgs);
		}

		const result = await comp.execute(testNetClientalgod, 2);
		console.log(result);
		for (const idx in result.methodResults) {
			console.log(result.methodResults[idx]);
		}
		return result;
	}
	async function optinD4T() {
		const suggested = await apiGetTxnParams(ChainType.TestNet);
		const contract = await getContractAPI();

		console.log(contract);
		// Utility function to return an ABIMethod by its name
		function getMethodByName(name: string): algosdk.ABIMethod {
			const m = contract.methods.find((mt: algosdk.ABIMethod) => {
				return mt.name == name;
			});
			if (m === undefined) throw Error('Method undefined: ' + name);
			return m;
		}
		const myAlgoConnect = new MyAlgoConnect();
		const signer = getSigner(myAlgoConnect);
		// We initialize the common parameters here, they'll be passed to all the transactions
		// since they happen to be the same
		const commonParams = {
			appID: contract.networks['default'].appID,
			sender: address,
			suggestedParams: suggested,
			onComplete: OnApplicationComplete.OptInOC,
			signer: signer,
		};
		const comp = new algosdk.AtomicTransactionComposer();

		const MNG = 84436122;

		comp.addMethodCall({
			method: getMethodByName('optin'),
			methodArgs: [MNG],
			...commonParams,
		});
		//const pay_txn = getPayTxn(suggested, sw.getDefaultAccount());

		//comp.addTransaction({ txn: pay_txn, signer: sw.getSigner() });

		// This is not necessary to call but it is helpful for debugging
		// to see what is being sent to the network
		const g = comp.buildGroup();
		console.log(g);

		const result = await comp.execute(testNetClientalgod, 2);
		console.log(result);

		return result;
	}
	async function mborrow() {
		const suggested = await apiGetTxnParams(ChainType.TestNet);
		const suggestedParams = await apiGetTxnParams(ChainType.TestNet);
		const contract = await getContractAPI();

		console.log(contract);
		// Utility function to return an ABIMethod by its name
		function getMethodByName(name: string): algosdk.ABIMethod {
			const m = contract.methods.find((mt: algosdk.ABIMethod) => {
				return mt.name == name;
			});
			if (m === undefined) throw Error('Method undefined: ' + name);
			return m;
		}

		const myAlgoConnect = new MyAlgoConnect();
		const signer = getSigner(myAlgoConnect);

		suggested.flatFee = true;
		suggested.fee = 4000;
		let acct = algosdk.mnemonicToSecretKey(
			process.env.NEXT_PUBLIC_MEMONIC_VUI as string
		);
		// We initialize the common parameters here, they'll be passed to all the transactions
		// since they happen to be the same
		const commonParams = {
			appID: contract.networks['default'].appID,
			sender: address,
			suggestedParams: suggested,
			onComplete: OnApplicationComplete.NoOpOC,
			signer, //: algosdk.makeBasicAccountTransactionSigner(acct),
		};
		const comp = new algosdk.AtomicTransactionComposer();
		//'QmNU1gEgZKnMAL9gEWdWXAmuaDguUFhbGYqLw4p1iCGrSc' //'QmRY9HMe2fb6HAJhywnTTYQamLxQV9qJbjVeK7Wa314TeR' 'QmdvvuGptFDAoB6Vf9eJcPeQTKi2MjA3AnEv47syNPz6CS'
		const borrowLogic = await borrowGetLogic(
			'QmXJWc7jeSJ7F2Cc4cm6SSYdMnAiCG4M4gfaiQXvDbdAbL' //'QmWFR6jSCaqfxjVK9S3PNNyyCh35kYx5sGgwi7eZAogpD9' //'QmciTBaxmKRF9fHjJP7q83f9nvBPf757ocbyEvTnrMttyM' //'QmdHj2MHo6Evzjif3RhVCoMV2RMqkxvcZqLP946cN77ZEN' //'QmfWfsjuay1tJXJsNNzhZqgTqSj3CtnMGtu7NK3bVtdh6k' //'QmPubkotHM9iArEoRfntSB6VwbYBLz19c1uxmTp4FYJzbk' //'QmaDABqWt3iKso3YjxRRBCj4HJqqeerAvrBeLTMTTz7VzY' //'QmbbDFKzSAbBpbmhn9b31msyMz6vnZ3ZvKW9ebBuUDCyK9' //'QmYoFqC84dd7K5nCu5XGyWGyqDwEs7Aho8j46wqeGRfuJq' //'QmaGYNdQaj2cygMxxDQqJie3vfAJzCa1VBstReKY1ZuYjK'
		);
		console.log(borrowLogic);
		const borrowLogicSig = borrowLogic;
		const addressLogicSig =
			'KLNYAXOWHKBHUKVDDWFOSXNHYDS45M3KJW4HYJ6GOQB4LGAH4LJF57QVZI';
		const amountborrowing = 1000000;
		const xids = [NFTColl];
		const camt = [1];
		const lamt = [1000000];
		const USDC = 10458941;
		const DUSD = 84436770;
		const MNG = 84436122;
		const LQT = 84436752;
		/* let lsiga = algosdk.logicSigFromByte(borrowLogicSig);
		console.log(lsiga);
		console.log(lsiga.toByte()); */

		console.log('Logic sig here');
		let lsig = algosdk.LogicSigAccount.fromByte(borrowLogicSig);
		console.log(lsig.verify());
		console.log(lsig.toByte());
		suggestedParams.flatFee = true;
		suggestedParams.fee = 0;
		const ptxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
			from: addressLogicSig, //Lender address
			to: address, //Borrower address
			amount: amountborrowing,
			assetIndex: USDC,
			suggestedParams,
		});

		// Construct TransactionWithSigner
		const tws = {
			txn: ptxn,
			signer: algosdk.makeLogicSigAccountTransactionSigner(lsig),
		};
		comp.addTransaction(tws);
		comp.addMethodCall({
			method: getMethodByName('borrow'),
			methodArgs: [xids, camt, lamt, addressLogicSig, xids[0], DUSD, MNG, LQT],
			...commonParams,
		});
		//const pay_txn = getPayTxn(suggested, sw.getDefaultAccount());

		//comp.addTransaction({ txn: pay_txn, signer: sw.getSigner() });

		// This is not necessary to call but it is helpful for debugging
		// to see what is being sent to the network
		const g = comp.buildGroup();
		console.log(g);
		for (const x in g) {
			console.log(g[x].txn.appArgs);
		}

		const result = await comp.execute(testNetClientalgod, 2);
		console.log(result);
		for (const idx in result.methodResults) {
			console.log(result.methodResults[idx]);
		}
		return result;
	}
	async function repay() {
		const suggested = await apiGetTxnParams(ChainType.TestNet);
		const suggestedParams = await apiGetTxnParams(ChainType.TestNet);
		const contract = await getContractAPI();

		console.log(contract);
		// Utility function to return an ABIMethod by its name
		function getMethodByName(name: string): algosdk.ABIMethod {
			const m = contract.methods.find((mt: algosdk.ABIMethod) => {
				return mt.name == name;
			});
			if (m === undefined) throw Error('Method undefined: ' + name);
			return m;
		}
		const signer = getSignerWC(connector, address);
		suggested.flatFee = true;
		suggested.fee = 3000;
		// We initialize the common parameters here, they'll be passed to all the transactions
		// since they happen to be the same
		const commonParams = {
			appID: contract.networks['default'].appID,
			sender: address,
			suggestedParams: suggested,
			signer: signer,
		};
		const comp = new algosdk.AtomicTransactionComposer();

		const APP_ID = contract.networks['default'].appID;
		const xids = [97931298];
		const ramt = [1030000];
		const USDC = 10458941;
		const MNG = 84436122;
		const LQT = 84436752;
		suggestedParams.flatFee = true;
		suggestedParams.fee = 0;
		const ptxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
			from: address,
			to: algosdk.getApplicationAddress(APP_ID),
			amount: ramt[0],
			assetIndex: USDC,
			suggestedParams,
		});
		const tws = {
			txn: ptxn,
			signer: signer,
		};

		comp.addMethodCall({
			method: getMethodByName('repay'),
			methodArgs: [tws, xids, ramt, xids[0], MNG, LQT],
			...commonParams,
		});
		//const pay_txn = getPayTxn(suggested, sw.getDefaultAccount());

		//comp.addTransaction({ txn: pay_txn, signer: sw.getSigner() });

		// This is not necessary to call but it is helpful for debugging
		// to see what is being sent to the network
		const g = comp.buildGroup();
		console.log(g);

		const result = await comp.execute(testNetClientalgod, 2);
		console.log(result);

		return result;
	}
	async function walletConnectSigner(
		txns: Transaction[],
		connector: WalletConnect | null,
		address: string
	) {
		if (!connector) {
			console.log('No connector found!');
			return txns.map((tx) => {
				return {
					txID: tx.txID(),
					blob: new Uint8Array(),
				};
			});
		}
		const txnsToSign = txns.map((txn) => {
			const encodedTxn = Buffer.from(
				algosdk.encodeUnsignedTransaction(txn)
			).toString('base64');
			if (algosdk.encodeAddress(txn.from.publicKey) !== address)
				return { txn: encodedTxn };
			return { txn: encodedTxn };
		});
		// sign transaction
		const requestParams: SignTxnParams = [txnsToSign];

		const request = formatJsonRpcRequest('algo_signTxn', requestParams);
		//console.log('Request param:', request);
		const result: string[] = await connector.sendCustomRequest(request);

		//console.log('Raw response:', result);
		return result.map((element, idx) => {
			return element
				? {
						txID: txns[idx].txID(),
						blob: new Uint8Array(Buffer.from(element, 'base64')),
				  }
				: {
						txID: txns[idx].txID(),
						blob: new Uint8Array(),
				  };
		});
	}
	function getSignerWC(
		connector: WalletConnect,
		address: string
	): TransactionSigner {
		return async (txnGroup: Transaction[], indexesToSign: number[]) => {
			const txns = await Promise.resolve(
				walletConnectSigner(txnGroup, connector, address)
			);
			return txns.map((tx) => {
				return tx.blob;
			});
		};
	}

	const DynamicComponentWithNoSSR = dynamic(
		() => import('../components/WalletSelector'),
		{
			ssr: false,
		}
	);
	const connectToMyAlgo = async (accounts: any) => {
		try {
			const address: string = accounts[0]['address'];

			AddressContext.setConnected(true);
			setAccounts(accounts);
			AddressContext.setAddress(address);

			try {
				// get account balances
				const assets = await apiGetAccountAssets(chain, address);
				AddressContext.setAddress(address);
				AddressContext.setAssets(assets);
			} catch (error) {
				console.error(error);
				//await this.setStateAsync({ fetching: false });
			}
		} catch (err) {
			console.error(err);
			//await this.setStateAsync({ ...INITIAL_STATE });
		}
	};
	const returnWallet = async (data: any) => {
		if (!!data) {
			try {
				console.log(data.connector.check());
				const accounts = await data.connector.connect();
				const connector = data.connector.provider;
				console.log(connector);

				const a = data.connector;
				console.log(a);
				console.log(accounts);

				if (a['provider']['protocol'] === 'wc') {
					// subscribe to events, if walletconnect
					//console.log(wprovider);
					//await this.walletConnectInit();
				} else if (a['provider']['url']) {
					const onClearResponse = (): void => {
						AddressContext.setConnected(false);
						setAccounts([]);
						AddressContext.setAddress('');
					};

					try {
						AddressContext.setMConnector(data.connector);
						await connectToMyAlgo(accounts);
					} catch (err) {
						//console.error(err);
					}
				}
			} catch (error) {
				console.error(error);
				toast.error(`Window not loaded`, {
					position: 'top-left',
					autoClose: 4000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			}
		}
	};
	async function atomic(name: string) {
		const assetsInfo = await testNetClientindexer
			.searchForAssets()
			.unit(name)
			.do();
		//console.log(assetsInfo);
		const arrayAssets: [] = assetsInfo.assets;
		try {
			const filtered = arrayAssets.filter(
				(assets: any) => assets.deleted === false //&&assets.params.manager ==='EADMVBZHVH3KZE4MOGD67PSFPQODIMZRQ43CQPGVFFKS6EEJUUMHN4NKVU'
			);
			//search
			//console.log(filtered);
			let newArray: any = [];
			filtered.forEach((asset: any) => {
				newArray.push({ value: asset.index, label: asset.params['unit-name'] });
			});
			//console.log(filtered);
			//console.log(newArray);
			return newArray;
		} catch (error) {
			console.log(error);
		}
	}

	const loadOptions = (
		inputValue: string,
		callback: (options: iOption[]) => void
	) => {
		setTimeout(async () => {
			try {
				// Fetch data
				const data = await atomic(inputValue);
				if (data !== undefined) {
					console.log(data);

					// Extract data and populate AsyncSelect
					const tempArray: iOption[] = [];

					data.forEach((element: any) => {
						tempArray.push({
							label: `${element.label}: ${element.value}`,
							value: `${element.value}`,
						});
					});
					callback(
						tempArray.filter((i) =>
							i.label.toLowerCase().includes(inputValue.toLowerCase())
						)
					);
				}
			} catch (error) {
				console.log(error);
				callback([]);
			}
		});
	};
	const handleInputChange = (newValue: string) => {
		const inputValue = newValue.replace(/\W/g, '');
		//setInputValue(inputValue);
		return inputValue;
	};
	const [lvrNow, setLvrNow] = useState(0);

	return (
		<div className='w-full h-screen text-center'>
			{/* max-w-[1240px] w-full h-full mx-auto p-2 flex justify-center items-center */}
			<div className=''>
				<div className='max-w-6xl mx-auto px-4 sm:px-6'>
					{/* content */}
					<div className='pt-16 pb-8 md:pt-20 md:pb-20'>
						{/* Section header */}
						{!address ? (
							<div className='text-center pb-14 md:pb-16'>
								<p className='uppercase text-sm tracking-widest text-gray-600'>
									A simple earn demo with myAlgo wallet for Logicsig
								</p>
								<h1 className='mt-2 flex flex-col items-center justify-center w-screen '>
									<div className='bg-gradient-to-r from-pink-600 to-orange-600 text-lg rounded-md w-48'>
										<DynamicComponentWithNoSSR
											returnWallet={returnWallet}
											wallets={['myalgowallet', 'walletconnect']}
										/>
										Try the Demo
									</div>
								</h1>
							</div>
						) : (
							<>
								{openPage === 1 ? (
									<>
										<div className='flex whitespace-nowrap space-x-10 sm:space-x-20 '>
											<div className='group'>
												<button
													className={`flex flex-auto items-center min-w-min max-w-max pl-14 pr-0 pb-0.5 cursor-pointer transition duration-100 group-hover:text-indigo-500 
					`}
													onClick={(e) => {
														e.preventDefault();
														setOpenPage(0);
													}}
												>
													<span className='border-b-2'>{'Faucets'}</span>
												</button>
											</div>
										</div>
										<div className='flex flex-col items-center justify-center w-screen flex-1 px-20 text-center'>
											<div className='bg-white rounded-2xl shadow-2xl flex w-4/5 md:w-2/3 max-w-4xl'>
												{/* Earn section */}
												<div className='w-1/2 md:w-4/5 p-5'>
													<div
														className='text-left font-bold'
														onClick={async (e) => {
															e.preventDefault();
															try {
																await optinD4T();
															} catch (error) {}
														}}
													>
														<span className='text-orange-600 cursor-pointer hover:text-gray-400'>
															OPT
														</span>
														<span className='hover:text-orange-600 cursor-pointer'>
															-in
														</span>
													</div>
													<p className='leading-none text-3xl font-bold text-orange-600 mb-2'>
														Earn
													</p>
													<div className='border-2 w-10 border-orange-600 inline-block mb-2'></div>
													<AsyncSelect
														className='mb-3'
														placeholder='Select NFT/Assets'
														onInputChange={handleInputChange}
														onChange={async (option) => {
															setSelectedAssets(option as iOption[]);
															//console.log(selectedAssets);
														}}
														isMulti
														cacheOptions
														defaultOptions
														loadOptions={loadOptions}
													/>
													<form className='flex w-full mt-5 hover:shadow-lg focus-within:shadow-lg max-w-md rounded-full border border-gray-200 px-5 py-3 items-center sm:max-w-xl lg:max-w-2xl'>
														<div className='relative px-7 py-2 rounded-md leading-none flex items-center divide-x divide-gray-500'>
															<span
																className='pr-2 text-indigo-400 cursor-pointer hover:text-pink-600 transition duration-200'
																onClick={async (e) => {
																	e.preventDefault();
																	if (searchInputRef.current !== null)
																		searchInputRef.current.focus();
																	const Myassets = await apiGetAccountAssets(
																		chain,
																		address
																	);
																	const USDCtoken = Myassets.find(
																		(asset: IAssetData) =>
																			asset && asset.id === USDC
																	) || {
																		id: USDC,
																		amount: BigInt(0),
																		creator: '',
																		frozen: false,
																		decimals: 6,
																		name: 'usdc',
																		unitName: 'USDC',
																	};
																	setUserInput(
																		Number(
																			formatBigNumWithDecimals(
																				BigInt(USDCtoken.amount),
																				USDCtoken.decimals
																			)
																		)
																	);
																}}
															>
																MAX
															</span>
															<span className='pl-2 text-gray-500'>USDC</span>
														</div>

														<input
															ref={searchInputRef}
															type='number'
															className='flex-grow focus:outline-none bg-[#FAFAFA]'
															placeholder='Allowed amount'
															value={userInput}
															onChange={(e) =>
																setUserInput(Number(e.target.value))
															}
														/>
													</form>
													<form className='flex w-full mt-5 hover:shadow-lg focus-within:shadow-lg max-w-md rounded-full border border-gray-200 px-5 py-3 items-center sm:max-w-xl lg:max-w-2xl'>
														<div className='relative px-7 py-2 rounded-md leading-none flex items-center divide-x divide-gray-500'>
															<span
																className='pr-2 text-indigo-400 cursor-pointer hover:text-pink-600 transition duration-200'
																onClick={(e) => {
																	e.preventDefault();
																	if (expiringdayRef.current !== null)
																		expiringdayRef.current.focus();
																	setExpDay(10);
																	//expiringdayRef.current.value = 10;
																}}
															>
																Expire Day
															</span>
														</div>
														<input
															ref={expiringdayRef}
															type='number'
															className='flex-grow focus:outline-none'
															placeholder='10 days'
															value={expDay}
															onChange={(e) =>
																setExpDay(Number(e.target.value))
															}
														/>
													</form>
													{hashIpfs ? (
														<button
															onClick={async (e) => {
																e.preventDefault();
																try {
																	await stake();
																} catch (error) {}
															}}
															className='bg-gradient-to-r from-gray-100 to-red-300 border-2 p-3 mt-2 rounded-md ring-gray-200 text-sm text-gray-800 hover:ring-1 focus:outline-none active:ring-gray-300 hover:shadow-md'
														>
															Stake - Promise
														</button>
													) : (
														<div className='group'>
															<span
																hidden={!wc}
																className='absolute w-auto p-2 m-2 min-w-max left-48 rounded-md text-white bg-gray-900 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100'
															>
																You should use myAlgoWallet for this!
															</span>
															<button
																onClick={async (e) => {
																	e.preventDefault();
																	try {
																		await logic();
																	} catch (error) {}
																}}
																className={
																	!wc
																		? `border-gray-400 border-2 p-3 mt-2 rounded-md ring-gray-200 text-sm font-semibold hover:ring-1 focus:outline-none active:ring-gray-300 hover:shadow-md hover:bg-gray-400 hover:text-white`
																		: `hover:bg-gray-400 text-gray-400`
																}
															>
																Sign
															</button>
														</div>
													)}
												</div>
												{/* Mini dashboard */}
												<div className='w-1/2 md:w-2/5 bg-orange-600 items-center rounded-tr-2xl rounded-br-2xl py-10 px-12 text-white'>
													<p className='text-gray-100 leading-none text-3xl font-bold'>
														Your promise
													</p>
													{/* <div className='border-2 w-10 border-white inline-block mb-2'></div> */}
													<button
														onClick={async (e) => {
															e.preventDefault();
															await checkAllowedAmount();
															const firstRound = await testNetClientalgod
																.getTransactionParams()
																.do()
																.then((res) => res.firstRound);

															setLvrNow((displayLend.lvr - firstRound) / 17280);
														}}
														className='border-white border-2 p-3 mt-2 rounded-md ring-gray-200 text-sm font-semibold hover:ring-1 focus:outline-none active:ring-gray-300 hover:shadow-md hover:bg-white hover:text-orange-600'
													>
														{lvrNow < 0 ? <>Exp-Day</> : <>View</>}
													</button>
													{displayLend.lvr > 0 ? (
														<div className='mt-4'>
															<>
																Assets:{' '}
																{displayLend.xids.map((value) => value + ',')}
															</>
															<div>Amount: {displayLend.aamt.toFixed(2)}</div>
															{lvrNow > 0 ? (
																<div>Expiring in: {lvrNow.toFixed(2)} day</div>
															) : (
																<></>
															)}
														</div>
													) : (
														<></>
													)}
												</div>
											</div>
										</div>
									</>
								) : openPage === 0 ? (
									<>
										<div className='group'>
											<a
												className={`flex flex-auto items-center max-w-min pl-14 border-transparent pb-0.5 cursor-pointer transition duration-100 group-hover:text-indigo-500 group-hover:border-indigo-500
					`}
												onClick={(e) => {
													e.preventDefault();
													setOpenPage(1);
												}}
											>
												<span className='border-b-2 '>{'Back'}</span>
											</a>
										</div>
										<Faucets
											assets={assets}
											address={address}
											connector={connector}
											chain={chain}
											wc={wc}
											mconnector={mconnector}
										/>
									</>
								) : (
									<>
										<div className='group'>
											<a
												className={`flex flex-auto items-center max-w-min pl-14 border-transparent pb-0.5 cursor-pointer transition duration-100 group-hover:text-indigo-500 group-hover:border-indigo-500
					`}
												onClick={(e) => {
													e.preventDefault();
													setOpenPage(1);
												}}
											>
												<span className='border-b-2 '>{'Back'}</span>
											</a>
										</div>
										<p>New page</p>
									</>
								)}
							</>
						)}
					</div>
				</div>
			</div>
			<NeosOpen />
		</div>
	);
};
export async function checkAssetOptin(assetId: number, address: string) {
	const accountInfo = await testNetClientindexer
		.lookupAccountAssets(address)
		.assetId(assetId)
		.do();
	if (accountInfo.assets.length > 0) {
		return accountInfo['assets'];
	}
	return false;
}
export default Main;
