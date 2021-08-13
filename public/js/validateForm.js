const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const changePasswordForm = document.getElementById('change-password-form');

if (loginForm) {
	loginForm.addEventListener('submit', validateLogin);
}

if (registerForm) {
	registerForm.addEventListener('submit', validateRegister);
}

if (changePasswordForm) {
	changePasswordForm.addEventListener('submit', validateChangePassword);
}

/**
 * Validates the login form
 * @param {Event} event - form submit event
 * @listens SubmitEvent
 */
function validateLogin(event) {
	try {
		handleGeneralFormError(this.querySelector('.form-feedback'));
		const { email, password } = this.elements;
		
		// Validate email format
		const emailError = isEmailInvalid(email.value);
		const emailFeedback = email.parentNode.querySelector('.feedback');
		handleError(email, emailFeedback, emailError);
		
		// Check that password is entered
		const passwordError = isPasswordInvalid(password.value, { checkFormat: false });
		const passwordFeedback = password.parentNode.querySelector('.feedback');
		handleError(password, passwordFeedback, passwordError);

		if (emailError || passwordError) {
			showGeneralFormError(this.querySelector('.form-feedback'));
			event.preventDefault();
		}
	} catch (error) {
		handleGeneralFormError(this.querySelector('.form-feedback'), true);
		event.preventDefault();
	}
}

/**
 * Validates the register form
 * @param {Event} event - form submit event
 * @listens SubmitEvent
 */
function validateRegister(event) {
	try {
		handleGeneralFormError(this.querySelector('.form-feedback'));
		const { name, email, password } = this.elements;
		const confirmPassword = this.elements['confirm-password'];

		// Validate name
		const nameError = isNameInvalid(name.value);
		const nameFeedback = name.parentNode.querySelector('.feedback');
		handleError(name, nameFeedback, nameError);
		
		// Validate email format
		const emailError = isEmailInvalid(email.value);
		const emailFeedback = email.parentNode.querySelector('.feedback');
		handleError(email, emailFeedback, emailError);
		
		// Validate password format
		const passwordError = isPasswordInvalid(password.value);
		const passwordFeedback = password.parentNode.querySelector('.feedback');
		handleError(password, passwordFeedback, passwordError);

		// Validate confirmPassword
		const confirmPasswordError = isPasswordConfirmed(password.value, confirmPassword.value);
		const confirmPasswordFeedback = confirmPassword.parentNode.querySelector('.feedback');
		handleError(confirmPassword, confirmPasswordFeedback, confirmPasswordError);

		if (nameError || emailError || passwordError || confirmPasswordError) {
			event.preventDefault();
		}
	} catch (error)	{
		handleGeneralFormError(this.querySelector('.form-feedback'), true);
		event.preventDefault();
	}
	
}

/**
 * Validates the change password form
 * @param {Event} event - form submit event
 * @listens SubmitEvent
 */
 function validateChangePassword(event) {
	try {
		handleGeneralFormError(this.querySelector('.form-feedback'));

		const currentPassword = this.elements['current-password'];
		const newPassword = this.elements.password;
		const confirmPassword = this.elements['confirm-password'];

		// Validate currentPassword
		const currentPasswordError = isPasswordInvalid(
			currentPassword.value, 
			{ checkFormat: false, fieldName: "current password" }
		);
		const currentPasswordFeedback = currentPassword.parentNode.querySelector('.feedback');
		handleError(currentPassword, currentPasswordFeedback, currentPasswordError);
		
		// Validate newPassword
		const newPasswordError = isPasswordInvalid(newPassword.value, { fieldName: "new password" });
		const newPasswordFeedback = newPassword.parentNode.querySelector('.feedback');
		handleError(newPassword, newPasswordFeedback, newPasswordError);

		// Validate confirmPassword
		const confirmPasswordError = isPasswordConfirmed(newPassword.value, confirmPassword.value);
		const confirmPasswordFeedback = confirmPassword.parentNode.querySelector('.feedback');
		handleError(confirmPassword, confirmPasswordFeedback, confirmPasswordError);

		if (currentPasswordError || newPasswordError || confirmPasswordError) {
			event.preventDefault();
		}
	} catch (error)	{
		handleGeneralFormError(this.querySelector('.form-feedback'), true);
		event.preventDefault();
	}
}

/**  
 * Checks if email input is invalid. Returns: false (if valid), error message (if invalid)
 * @param {string} emailText String value of email
*/
function isEmailInvalid (emailText) {
	const emailRegex = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;

	if (emailText === "") {
		return "Please enter your email address."; 
	}

	if (!emailRegex.test(emailText)) {
		return "Hmmm...the email address entered seems invalid.";
	}

	return false;
}

/** 
	* Checks if password provided is invalid (empty or not conforming to rules)
	* Returns: false (if valid), error message (if invalid)
	* @param {string} passwordText String value of password
	* @param {Object} [options] - password validation options
	* @param {boolean} [options.checkFormat = true] Boolean indicating if password format should be checked. Default = true.
	* @param {string} [options.fieldName = "password"] String value of field name. Default = "password".
*/
function isPasswordInvalid (passwordText, { checkFormat = true, fieldName = "password" }) {
	if (passwordText === "") {
		return `Please enter your ${fieldName}.`;
	}

	if (checkFormat) {
		// Check passsword format rules
		if (passwordText.length < 8){
			return "Password should be at least 8 characters.";
		}
	
		if (!(/\d/.test(passwordText) && /[a-zA-Z]/.test(passwordText))){
			return "Password should contain both letters and numbers.";
		}
	}

	return false;
}

// FUNCTIONS TO VALIDATE SINGLE FIELD

/**  
 * Checks if name is invalid. Returns: false (if valid), error message (if invalid)
 * @param {string} nameText String value of name
*/
function isNameInvalid (nameText) {
	if (nameText === "") {
		return "Please enter your name."; 
	}

	return false;
}

/**  
 * Checks if password is confirmed correctly. Returns: false (if confirmed), error message (if not confirmed)
 * @param {string} passwordText String value of password
 * @param {string} confirmPasswordText String value of confirmPassword
*/
function isPasswordConfirmed (passwordText, confirmPasswordText) {
	if (passwordText !== confirmPasswordText || confirmPasswordText === "") {
		return "Please confirm your password correctly."; 
	}

	return false;
}

/**
 * Handles display of the feedback element for an input
 * @param {HTMLElement} inputElement 
 * @param {HTMLElement} feedbackElement 
 * @param {(string|boolean)} error 
 */
function handleError (inputElement, feedbackElement, error) {
	if (error) {
		feedbackElement.innerText = error;
		feedbackElement.classList.add('invalid');
		feedbackElement.classList.remove('valid');
		inputElement.classList.add('invalid-input');
		inputElement.classList.remove('valid-input');
	} else {
		feedbackElement.innerText = "Looks good!";
		feedbackElement.classList.add('valid');
		feedbackElement.classList.remove('invalid');
		inputElement.classList.add('valid-input');
		inputElement.classList.remove('invalid-input');
	}
}

/**
 * Handles display of the general feedback element for the form
 * @param {HTMLElement} feedbackElement 
 * @param {boolean} [isError = false] 
 */
function handleGeneralFormError (feedbackElement, isError = false) {
	if (isError) {
		feedbackElement.classList.add('invalid');
		feedbackElement.innerText = "Something went wrong, please try after sometime";
	} else {
		feedbackElement.classList.remove('invalid');
		feedbackElement.innerText = "";
	}
	
}