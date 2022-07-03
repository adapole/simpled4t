import * as React from 'react';
import * as PropTypes from 'prop-types';
import styled from 'styled-components';

const transitions = {
	short: 'all 0.1s ease-in-out',
	base: 'all 0.2s ease-in-out',
	long: 'all 0.3s ease-in-out',
	button: 'all 0.15s ease-in-out',
};
const colors = {
	white: '255, 255, 255',
	black: '0, 0, 0',
	dark: '12, 12, 13',
	grey: '169, 169, 188',
	darkGrey: '113, 119, 138',
	lightGrey: '212, 212, 212',
	blue: '101, 127, 230',
	lightBlue: '64, 153, 255',
	yellow: '250, 188, 45',
	orange: '246, 133, 27',
	green: '84, 209, 146',
	pink: '255, 51, 102',
	red: '214, 75, 71',
	purple: '110, 107, 233',
};

interface ILightboxStyleProps {
	show: boolean;
	offset: number;
	opacity?: number;
}

const SLightbox = styled.div<ILightboxStyleProps>`
	transition: opacity 0.1s ease-in-out;
	text-align: center;
	position: absolute;
	width: 100vw;
	height: 100vh;
	margin-left: -50vw;
	top: ${({ offset }) => (offset ? `-${offset}px` : 0)};
	left: 50%;
	z-index: 2;
	will-change: opacity;
	background-color: ${({ opacity }) => {
		let alpha = 0.4;
		if (typeof opacity === 'number') {
			alpha = opacity;
		}
		return `rgba(0, 0, 0, ${alpha})`;
	}};
	opacity: ${({ show }) => (show ? 1 : 0)};
	visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
	pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
	display: flex;
	justify-content: center;
	align-items: center;
`;

const SModalContainer = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	padding: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const SHitbox = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
`;

interface ICloseButtonStyleProps {
	size: number;
	color: string;
	onClick?: any;
}

const SCloseButton = styled.div<ICloseButtonStyleProps>`
	transition: ${transitions.short};
	position: absolute;
	width: ${({ size }) => `${size}px`};
	height: ${({ size }) => `${size}px`};
	right: ${({ size }) => `${size / 1.6667}px`};
	top: ${({ size }) => `${size / 1.6667}px`};
	opacity: 0.5;
	cursor: pointer;
	&:hover {
		opacity: 1;
	}
	&:before,
	&:after {
		position: absolute;
		content: ' ';
		height: ${({ size }) => `${size}px`};
		width: 2px;
		background: ${({ color }) =>
			`rgb(${colors[color as keyof typeof colors]})`};
	}
	&:before {
		transform: rotate(45deg);
	}
	&:after {
		transform: rotate(-45deg);
	}
`;

const SCard = styled.div`
	position: relative;
	width: 100%;
	max-width: 500px;
	padding: 25px;
	background-color: rgb(${colors.white});
	border-radius: 6px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const SModalContent = styled.div`
	position: relative;
	width: 100%;
	position: relative;
	word-wrap: break-word;
`;

interface IModalState {
	offset: number;
}

interface IModalProps {
	children: React.ReactNode;
	show: boolean;
	toggleModal: any;
	opacity?: number;
}

const INITIAL_STATE: IModalState = {
	offset: 0,
};

class Modal extends React.Component<IModalProps, IModalState> {
	public static propTypes = {
		children: PropTypes.node.isRequired,
		show: PropTypes.bool.isRequired,
		toggleModal: PropTypes.func.isRequired,
		opacity: PropTypes.number,
	};

	public lightbox?: HTMLDivElement | null;

	public state: IModalState = {
		...INITIAL_STATE,
	};

	public componentDidUpdate() {
		if (this.lightbox) {
			const lightboxRect = this.lightbox.getBoundingClientRect();
			const offset = lightboxRect.top > 0 ? lightboxRect.top : 0;

			if (offset !== INITIAL_STATE.offset && offset !== this.state.offset) {
				this.setState({ offset });
			}
		}
	}

	public toggleModal = async () => {
		const d = typeof window !== 'undefined' ? document : '';
		const body = d ? d.body || d.getElementsByTagName('body')[0] : '';
		if (body) {
			if (this.props.show) {
				body.style.position = '';
			} else {
				body.style.position = 'fixed';
			}
		}
		this.props.toggleModal();
	};
	//        className='transition-opacity ease-in-out delay-150 text-center absolute min-w-screen h-screen left-0 top-0'
	public render() {
		const { offset } = this.state;
		const { children, show, opacity } = this.props;
		return (
			<SLightbox
				show={show}
				offset={offset}
				opacity={opacity}
				ref={(c) => (this.lightbox = c)}
			>
				<SModalContainer>
					<SHitbox onClick={this.toggleModal} />

					<SCard>
						<SCloseButton size={25} color={'dark'} onClick={this.toggleModal} />
						<SModalContent>{children}</SModalContent>
					</SCard>
				</SModalContainer>
			</SLightbox>
		);
	}
}

export default Modal;
