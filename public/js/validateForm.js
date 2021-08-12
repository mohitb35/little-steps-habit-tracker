const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (loginForm) {
	loginForm.addEventListener('submit', validateLoginForm);
}

if (registerForm) {
	registerForm.addEventListener('submit', validateRegisterForm);
}

/**
 * Validates the login form
 * @param {Event} event - form submit event
 * @listens SubmitEvent
 */
function validateLoginForm(event) {
	try {
		handleGeneralFormError(this.querySelector('.form-feedback'));
		const { email, password } = this.elements;
		
		// Validate email format
		const emailError = isEmailInvalid(email.value);
		const emailFeedback = email.parentNode.querySelector('.feedback');
		handleError(email, emailFeedback, emailError);
		
		// Check that password is entered
		const passwordError = isPasswordInvalid(password.value, true);
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
function validateRegisterForm(event) {
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
		const passwordError = isPasswordInvalid(password.value, false);
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
	* Note: In case of login, rules are not validated. Only presence of password is checked.
	* @param {string} passwordText String value of password
	* @param {boolean} [isLogin = false] Boolean indicating if validation is being done for Login
*/
function isPasswordInvalid (passwordText, isLogin = false) {
	if (passwordText === "") {
		return "Please enter your password.";
	}

	if (!isLogin) {
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
 * Handles display of the feedback element for an input
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