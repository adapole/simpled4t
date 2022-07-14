import React, { useState } from 'react';
import { Theme, toast } from 'react-toastify';
import Modal from './Modal';

type Props = {};

const NeosOpen = (props: Props) => {
	const [showModal, setShowModal] = useState(true);
	const toggleModal = () => {
		setShowModal(!showModal);
	};
	async function copyTextToClipboard(text: string) {
		if ('clipboard' in navigator) {
			return await navigator.clipboard.writeText(text);
		} else {
			return document.execCommand('copy', true, text);
		}
	}

	// onClick handler function for the copy button
	const handleCopyClick = () => {
		// Asynchronously call copyTextToClipboard
		copyTextToClipboard(
			'neosrec:///U-1egen/R-41a7cb88-b5d1-4cce-a8cd-c2885bafda30'
		)
			.then(() => {
				const options = {
					//theme: 'colored',
					autoClose: 20000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					position: toast.POSITION.TOP_RIGHT,
					type: toast.TYPE.SUCCESS,
				};
				toast(
					<div>
						Copied!
						<a
							target='_blank'
							href='https://neos.com/'
							rel='noopener noreferrer'
							className='uppercase text-sm tracking-widest text-orange-400 underline hover:text-orange-600'
						>
							{' '}
							Now go to Neosvr to explore the world
						</a>
					</div>,
					options
				);
			})
			.catch((err) => {
				console.log(err);
				toast.error(`Failed to copy`, {
					position: 'top-right',
					autoClose: 8000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
			});
	};
	return (
		<>
			<Modal show={showModal} toggleModal={toggleModal}>
				<div className='w-full relative break-words'>
					<div className='mt-1 mb-4 font-bold text-xl tracking-widest'>
						{'Open DeFi4NFT in Neos'}
					</div>
					<div className='h-full min-h-2 flex flex-col justify-center items-center break-words'>
						<p className='mb-2 text-sm tracking-widest text-gray-600'>
							We have created a virtual reality realm that is linked to the
							Algorand blockchain within the Neos metaverse. We developed this
							simple website to test the DeFi4NFT liquidity provider part as
							walletconnect does not yet support logicSig. Additionally, it has
							a facuet. For further interaction with DeFi4NFT, visit the Neos VR
							World.
						</p>
						<button
							onClick={(e) => {
								e.preventDefault();
								handleCopyClick();
							}}
							className='uppercase text-sm tracking-widest text-orange-400'
						>
							To experience defi in a metaverse{' '}
							<span className='text-orange-600 hover:underline'>
								copy world link
							</span>{' '}
							and open in Neos
						</button>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default NeosOpen;
