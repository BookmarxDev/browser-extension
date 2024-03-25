export const ParticlesConfig = {
	particles: {
		number: {
			value: 150,
			density: {
				enable: true,
				value_area: 1400
			}
		},
		color: {
			value: '#36baa2'
		},
		shape: {
			type: 'polygon',
			stroke: {
				width: 1,
				color: '#36baa2'
			},
			polygon: {
				nb_sides: 6
			}
		},
		opacity: {
			value: 1,
			random: true,
			anim: {
				enable: true,
				speed: 0.8,
				opacity_min: 0.25,
				sync: true
			}
		},
		size: {
			value: 2,
			random: true,
			anim: {
				enable: true,
				speed: 10,
				size_min: 1.25,
				sync: true
			}
		},
		line_linked: {
			enable: true,
			distance: 200,
			color: '#36baa2',
			opacity: 1,
			width: 1
		},
		move: {
			enable: true,
			speed: 3,
			direction: 'none',
			random: true,
			straight: false,
			out_mode: 'out',
			bounce: true,
			attract: {
				enable: true,
				rotateX: 2000,
				rotateY: 2000
			}
		}
	},
	interactivity: {
		detect_on: 'canvas',
		events: {
			onhover: {
				enable: true,
				mode: 'grab'
			},
			onclick: {
				enable: true,
				mode: 'repulse'
			},
			resize: true
		},
		modes: {
			grab: {
				distance: 200,
				line_linked: {
					opacity: 3
				}
			},
			repulse: {
				distance: 100,
				duration: 2
			}
		}
	},
	retina_detect: true
};