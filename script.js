const submitButton = document.getElementById("submitButton");
const languageSelector = document.getElementById("languageSelector");
const textArea = document.getElementById("input");
const outputScreen = document.getElementById("outputArea");
const animationDiv = document.getElementById("animation");

//! Adding Click Event Listener to Compile Button

submitButton.addEventListener("click", function (event) {
  var code = textArea.value;
  var langId = languageSelector.value;

  //> Data which will be sent to Server
  var postObj = {
    code: code,
    langId: langId,
  };

  //> Converting Data to a String
  var postData = JSON.stringify(postObj);

  //> Adding class loader to div to start loading animation
  animationDiv.classList.add("loader");

  //> Making POST request to API
  var request = new XMLHttpRequest();
  request.open("POST", "https://codequotient.com/api/executeCode");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(postData);

  request.addEventListener("load", function (event) {
    //> Response received for POST request
    var res = JSON.parse(event.target.responseText);

    //* if response contains an error
    if (res.hasOwnProperty("error")) {
      console.log(res.error);
    }
    //* if no error, codeId is received in resposne
    else if (res.hasOwnProperty("codeId")) {
      var codeId = res.codeId;

      //> Making GET request to server with CodeId after waiting for 5 sec, to get the output of code sent
      let timeout = setTimeout(function () {
        var request = new XMLHttpRequest();
        request.open(
          "GET",
          `https://codequotient.com/api/codeResult/${codeId}`
        );
        request.send(
          request.addEventListener("load", function (event) {
            var codeResponse = JSON.parse(event.target.responseText);

            //* the response received from API is an object with data key, which has string values so we parse it as well
            var responseData = JSON.parse(codeResponse.data);

            //* If object's data field is empty it means result is not ready or removed from server
            if (responseData !== null) {
              //> Removing class loader to div to stop loading animation
              animationDiv.classList.remove("loader");

              //* extracting output & errors from data object, if error occurs output is empty("")
              var errors = responseData.errors;
              var output = responseData.output;

              if (output !== "") {
                outputScreen.innerHTML = output;
              } else {
                outputScreen.innerHTML = errors;
              }
            }
          })
        );

        //> clearing the timeout
        clearTimeout(timeout);
      }, 5000);
    }
  });
});
