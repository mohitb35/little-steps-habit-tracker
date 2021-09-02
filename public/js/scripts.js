const body = document.querySelector('body');
const flashContainers = document.querySelectorAll('.flash');
const modalCloseButtons = document.querySelectorAll('.modal-close-button');
const logoutButton = document.getElementById('logout-button');
const trackingButtons = document.querySelectorAll('.tracking-button');

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

for (let modalCloseButton of modalCloseButtons) {
	modalCloseButton.addEventListener('click', hideModal);
}

function hideModal(event) {
	const targetModal = document.getElementById(this.dataset.target);
	targetModal.classList.add("hidden");
}

if (logoutButton) {
	logoutButton.addEventListener('click', showModal);
}

for (let trackingButton of trackingButtons) {
	trackingButton.addEventListener('click', showModal);
}

function showModal(event) {
	const title = this.dataset.title;
	const targetModal = document.getElementById(this.dataset.target);
	if (title) {
		const modalTitle = targetModal.querySelector(".modal-title");
		modalTitle.innerText = title;
	}
	targetModal.classList.remove("hidden");
};



