import React, { useState } from 'react';
import Modal from './Modal';

type Props = {};

const NeosOpen = (props: Props) => {
	const [showModal, setShowModal] = useState(true);
	const toggleModal = () => {
		setShowModal(!showModal);
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
							walletconnect does not support logicSig. Additionally, it has a
							facuet. For further interaction with DeFi4NFT, visit the Neos VR
							World.
						</p>
						<a
							target='_blank'
							href='neosrec:///U-1egen/R-41a7cb88-b5d1-4cce-a8cd-c2885bafda30'
							rel='noopener noreferrer'
							className='uppercase text-sm tracking-widest text-orange-400'
						>
							To experience defi in a metaverse{' '}
							<span className='text-orange-600 hover:underline'>
								click here
							</span>{' '}
							and open Neos
						</a>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default NeosOpen;
