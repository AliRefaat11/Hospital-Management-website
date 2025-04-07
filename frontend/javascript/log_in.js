	// Defining a function to display error message
    function printError(elemId, hintMsg) {
        document.getElementById(elemId).innerHTML = hintMsg;
    }
    printError("nameErr","name is not valid")
    
    // Defining a function to validate form 
    function validateForm(form) {
        // Retrieving the values of form elements 
        var name = form.name.value;
        var email = form.email.value;
        var mobile = form.mobile.value;
        var country = form.country.value;
        var gender = form.gender.value;
        
        // Defining error variables with a default value
        var nameErr = emailErr = mobileErr = countryErr = genderErr = true;
        
        // Validate name
        if(name == "") {
            printError("nameErr", "Please enter your name");
        } else {
            var regex = /^[a-zA-Z\s]+$/;                
            if(regex.test(name) === false) {
                printError("nameErr", "Please enter a valid name");
            } else {
                printError("nameErr", "");
                nameErr = false;
            }
        }
        
        // Validate email address
        if(email == "") {
            printError("emailErr", "Please enter your email address");
        } else {
            // Regular expression for basic email validation
            var regex = /^\S+@\S+\.\S+$/;
            if(regex.test(email) === false) {
                printError("emailErr", "Please enter a valid email address");
            } else{
                printError("emailErr", "");
                emailErr = false;
            }
        }
        
        // Validate mobile number
        if(mobile == "") {
            printError("mobileErr", "Please enter your mobile number");
        } else {
            var regex = /^[1-9]\d{9}$/;
            if(regex.test(mobile) === false) {
                printError("mobileErr", "Please enter a valid 10 digit mobile number");
            } else{
                printError("mobileErr", "");
                mobileErr = false;
            }
        }
        
        // Validate country
        if(country == "Select") {
            printError("countryErr", "Please select your country");
        } else {
            printError("countryErr", "");
            countryErr = false;
        }
        
        // Validate gender
        if(gender == "") {
            printError("genderErr", "Please select your gender");
        } else {
            printError("genderErr", "");
            genderErr = false;
        }
        
        // Prevent the form from being submitted if there are any errors
        if((nameErr || emailErr || mobileErr || countryErr || genderErr) == true) {
           return false;
        } else {
            // Creating a string from input data for preview
            var dataPreview = "You've entered the following details: \n" +
                              "Full Name: " + name + "\n" +
                              "Email Address: " + email + "\n" +
                              "Mobile Number: " + mobile + "\n" +
                              "Country: " + country + "\n" +
                              "Gender: " + gender + "\n";
    
            // Display input data in a dialog box before submitting the form
            alert(dataPreview);
        }
    };