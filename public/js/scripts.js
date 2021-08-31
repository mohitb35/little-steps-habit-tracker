const body = document.querySelector('body');
const flashContainers = document.querySelectorAll('.flash');
const modalCloseButtons = document.querySelectorAll('.modal-close-button');
const logoutButton = document.getElementById('logout-button');

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

logoutButton.addEventListener('click', showModal);

function showModal(event) {
	const targetModal = document.getElementById(this.dataset.target);
	targetModal.classList.remove("hidden");
}



