'use strict';

const slide = require('./lib/slides');
const Hammer = require('hammerjs');
const webrtc = require('./lib/webrtc');
let requestSlide = (() => {});
let triggerRemoteEvent = (() => {});

function goToSlide(i) {
	const newSlide = $(`.slide:nth-child(${i + 1})`);
	const oldSlide = $('.slide.active');
	const oldSlideId = oldSlide.attr('id');
	if (newSlide[0]) {
		oldSlide.removeClass('active');
		newSlide.addClass('active');
		slide.setup(newSlide.attr('id'));
		slide.teardown(oldSlideId);
		requestSlide(i);
	}
}

function goToNextSlide() {
	goToSlide($('.slide.active').prevAll().length + 1);
}

function goToPrevSlide() {
	goToSlide($('.slide.active').prevAll().length - 1);
}

function triggerEvent() {
	triggerRemoteEvent();
	if(slide.triggerEvent.next().done) {
		goToNextSlide();
	}
}

webrtc(location.hash === '#controller').then(d => {
	requestSlide = d.requestSlide;
	triggerRemoteEvent = d.triggerRemoteEvent;
	d.on('goToSlide', goToSlide);
	d.on('triggerEvent', triggerEvent);
}, err => {
	console.error('Failure to connect to webrtc', err);
});


window.addEventListener('keyup', e => {
	switch(e.keyCode) {
		case 37:
			goToPrevSlide();
			break;

		case 13:
		case 39:
			triggerEvent();
			break;
	}
});

var touches = new Hammer($('.slide-container')[0]);
touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });
touches.on('swipeleft', goToNextSlide);
touches.on('swiperight', goToPrevSlide);
$('.next-button').on('click', goToNextSlide);
$('.prev-button').on('click', goToPrevSlide);
$('.slide-container').on('click', triggerEvent);
goToSlide(0);