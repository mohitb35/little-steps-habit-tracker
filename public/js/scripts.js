const body = document.querySelector('body');
const flashContainers = document.querySelectorAll('.flash');
const modalCloseButtons = document.querySelectorAll('.modal-close-button');
const logoutButton = document.getElementById('logout-button');
const trackingButtons = document.querySelectorAll('.tracking-button');
const deleteButton = document.getElementById('delete-habit-button');

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

if (deleteButton) {
	deleteButton.addEventListener('click', showModal);
}

function showModal(event) {
	const { title, habitId, target, habitDueDate } = this.dataset;
	const targetModal = document.getElementById(target);
	if (title) {
		const modalTitle = targetModal.querySelector(".modal-title");
		modalTitle.innerText = title;
	}
	if (habitId) {
		const trackHabitForm = targetModal.querySelector("#track-habit-form");
		trackHabitForm.action = `/habits/${habitId}/track?_method=PUT`;
	}
	if (habitDueDate) {
		const modalText = targetModal.querySelector(".modal-text");
		modalText.innerText = `Did you complete this on ${printDate(habitDueDate)}?`;
	}
	targetModal.classList.remove("hidden");
};

function printDate(dateText) {
	let date = new Date(dateText);
	return date.toDateString();
}



