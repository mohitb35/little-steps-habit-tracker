let body = document.querySelector('body');
let flashContainers = document.querySelectorAll('.flash');

window.addEventListener('load', function () {
	body.classList.remove('preload');
});

for (let flashContainer of flashContainers) {
	flashContainer.addEventListener('click', closeFlash);
}

function closeFlash(event) {
	let closeButton = this.querySelector('.close-btn');
	if (event.target === closeButton) {
		this.classList.toggle('hidden');
	}
}