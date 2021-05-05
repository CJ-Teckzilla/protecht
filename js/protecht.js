let searchParams = new URLSearchParams(window.location.search);
const token = searchParams.get("token");
const callbackurl = searchParams.get("callbackurl");

// When the page will be loaded this will populate the fields got from merchant form
$(function(){
  let cardholdername = searchParams.get("first_name", "")+ " " + searchParams.get("last_name","")
  $('#cardholdername').val(cardholdername.replace(/(null null)|(null)/g, ""));
  $("#email").val(searchParams.get("email"));
  $("#address").val(searchParams.get("address1"));
  $("#zip_code").val(searchParams.get("zip_code"));
});

// On Successful Submission of Form
$(function(){
    $("#modal-form").bind("submit", function(e){
        e.preventDefault();
        if (tg.isFormComplete() == false){
            const msg= ["Please Select one of the option from the above iframe."];
            display_err(msg);
        }
        else{
            error = merchant_field();
            if (error == false){
                retrieve_data();
            }
        }
    });
});

function merchant_field(){
    let error = false;
    //checking required field
    const required_fields = ["order_number","currency", "city", "state", "country","name", "reference_number", "cost"];
    error = check_fields(required_fields);
    let cardholdername = $('#cardholdername').val().split(" ");
    let first_name = cardholdername[0];
    let last_name = cardholdername[1];
    if (first_name == undefined || first_name == ""){
      display_err(["First name is a required field"]);
      error = true;
    }
    if (last_name == undefined || last_name == ""){
      display_err(["Last name is a required field"]);
      error = true;
    }
    // if all the required field has been populated then we will validate single single field.
    if (error==false){
      //Validating state field as state field can have only 2 alphabets
      var state = searchParams.get("state");
      if (/^[a-zA-Z]{2}$/g.test(state) == false){
           display_err(["State field accepts only 2 characters."]);
           error = true;
      }
      //Validating country field as country field can have only 2 alphabets
      var country = searchParams.get("country");
      if (/^[a-zA-Z]{2}$/g.test(country) == false){
          display_err(["Country field accepts only 2 characters."]);
          error = true;
      }
      //Validating zip_code field as zip_code field can have only digits no alphabets and specail characters allowed.
      var zip_code = $('#zip_code').val();
      if(/^[0-9]+$/g.test(zip_code) == false){
          display_err(["Zip code accepts only digits no specail characters or alphabets are allowed."]);
          error = true;
      }
      // Validating Cost field as cost field can have digits only no alphabets or specail character allowed except from .
      let cost = searchParams.get("cost");
      if(/^[0-9]+.*[0-9]*$/g.test(cost) == false){
         display_err(["Cost accepts only digits no specail characters or alphabets are allowed."]);
         error = true;
      }
      // checking whether user wants to keep his shipping address same as billing address or not.
      // if user doesnt wants to keep shipping address same as billing address check for the following data below.
        var sameasbilling = searchParams.get("sameasbilling");
        // checking user has selected sameasbilling option or not
        if (sameasbilling == "off" || sameasbilling == null){
            const required_ship_fields = ["shipping_address1", "shipping_state", "shipping_country", "shipping_zip_code", "shipping_city"];
            error = check_fields(required_ship_fields); //sending required_fields for validation
            if(error == false){
              // Validating shipping address state field it only accepts 2 alphabets
              var state = searchParams.get("shipping_state");
              if (/^[a-zA-Z]{2}$/g.test(state) == false){
                   display_err(["State field accepts only 2 characters."]);
                   error = true;
              }
              // Validating shipping address country field it only accepts 2 alphabets
              var country = searchParams.get("shipping_country");
              if (/^[a-zA-Z]{2}$/g.test(country) == false){
                  display_err(["Country field accepts only 2 characters."]);
                  error = true;
              }
              //Validating shipping adress zip_code field as zip_code field can have only digits no alphabets and specail characters allowed.
              var zip_code = searchParams.get("shipping_zip_code");
              if(/^[0-9]+$/g.test(zip_code) == false){
                  display_err(["Zip code accepts only digits no specail characters or alphabets are allowed."]);
                  error = true;
              }
           }
        }
    }
    return error;
}

function check_fields(required_fields){
    var error = false;
    let errors = [];
    for(let x in required_fields){
        field = searchParams.get(required_fields[x]);
        if (field == ""){
            let field_name = required_fields[x].replace("_"," ");
            field_name = field_name.charAt(0).toUpperCase() + field_name.slice(1);
            errors.push(field_name + " is required field");
            error = true;
        }
    }
    if(errors){
        display_err(errors);
    }
    return error;
}



// On Closing the form call Add impression API
$(function(){
  $('btn-decline').bind('click',add_impression);
});

//Function to call Add impression API
function add_impression() {
   let quote_token = tg.get('token');
   fetch("https://api.ticketguardian-sandbox.com/impressions/",
        {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "JWT "+  token
            },
            body: JSON.stringify({"quote_token": quote_token})
        })
        .then(response => {return response.json()})
        .then(data1 => {console.log(data1);
              form_reset();
        });
}


// Retrieving Data from Forms
function retrieve_data() {
    // customer Data
    let customer_details = {
      "first_name":$('#cardholdername').val().split(" ")[0],
      "last_name": $("#cardholdername").val().split(" ")[1],
      "phone": searchParams.get("phone"),
      "email": $('#email').val()
    };

    // billing address data
     let billing_address = {
       "address1": $('#address').val(),
       "address2": searchParams.get("address2"),
       "city": searchParams.get("city"),
       "state": searchParams.get("state"),
       "country": searchParams.get("country"),
       "zip_code": $('#zip_code').val()
     };
    // shipping_address data
    //If customer has marked use billing address as Shipping address then populate the same data of billing
    if (searchParams.get("sameasbilling") == "on"){
         var shipping_address = billing_address;
         var shipping_address_status = true;
    }
    else{
        var shipping_address = {
          "address1": searchParams.get("shipping_address1"),
          "address2": searchParams.get("shipping_address2"),
          "city": searchParams.get("shipping_city"),
          "state": searchParams.get("shipping_state"),
          "country": searchParams.get("shipping_country"),
          "zip_code": searchParams.get("shipping_zip_code")
        };
        var shipping_address_status = false;
    }

  // Order data
   let item = {
     "name": searchParams.get("name"),
     "reference_number": searchParams.get("reference_number"),
     "cost": searchParams.get("cost")
   }

    // Card Details
    let card_details = {
        "number" : $('#number').val().replace(/\s+/g,""),
        "cvv" : $('#cvv').val(),
        "expiry_month" : $('#expiry_month').val().slice(0,2),
        "expiry_year" : $('#expiry_month').val().slice(3,),
    };
    // consolading the required data
    let all_data = {
        "quote": tg.get("token"),
        "customer": customer_details,
        "billing_address": billing_address,
        "ship_to_billing_addr": shipping_address_status,
        "shipping_address": shipping_address,
        "card": card_details,
        "order_number": searchParams.get("order_number"),
        "currency": searchParams.get("currency"),
        "items": [item],
    };
    send_request(all_data);
}

function send_request(all_data){
   fetch("https://connect-sandbox.ticketguardian.net/api/v2/orders/",
        {
            method: "POST",
            headers: {'Accept': 'application/json',
                      "Authorization": "JWT "+ token,
                      'content-type': 'application/json'},
            body: JSON.stringify(all_data)
        })
        .then(response => {
            if(response.status == 201){
                on_success_response(response.json());
            }
            else{
              on_fail_response(response.json());
              }
            });
        }




$("#expiry_month").focusout(function(){
    expiry_date = this.value;
    expiry_month = expiry_date.slice(0,2);
    expiry_year = expiry_date.slice(3,);
    pattern = new RegExp("(^[0][1-9]$)|(^[1][012]$)");
    result = pattern.test(expiry_month);
    if(result == false){
        this.setCustomValidity("Invalid Card Number");
    }
    else{
        date = new Date();
        mnth = date.getMonth() + 1;
        year = date.getYear().toString().slice(1,);
        if(year==expiry_year){
            if (expiry_month < mnth) {
                this.setCustomValidity("Invalid Expiry Date");
            }
            else{
                this.setCustomValidity("");
            }
        }
        else if(expiry_year < year){
            this.setCustomValidity("Invalid Expiry Date");
        }
        else if ((expiry_year == "")|(expiry_month == "")){
            this.setCustomValidity("Invalid Expiry Date");
        }
        else{
            this.setCustomValidity("");
        }
    }
}
)
//
$("#number").keyup(change_png);
$("#number").focusout(change_png);

$("#cvv").focusout(function(){
    card_num = document.getElementById("number");
     result = /^3[47]/g.test(card_num.value.replace(/\s+/g,""));
     if (result==true){
        if (this.value.length !=4) {
            this.setCustomValidity("Invalid cvv length.");
        }
        else{
            this.setCustomValidity("");
        }
    }
});

// for moving the focus from one input box to another
$('#expiry_month').keyup(function(){
if(this.value.length == 5){
        document.getElementById("cvv").focus();
    }
});

$('#cvv').keyup(function(){
    if(this.value.length == this.maxlength){
        this.focusout();
    }
})
//
$(document).ready(function(){
  $('#number').payment('formatCardNumber');
});

$('#number').focusout(function(){
    card_num = this.value.replace(/\s+/g,'');
    pattern = new RegExp("(^4[0-9]{12}([0-9]{3})?$)|(^5[1-5][0-9]{14}$|^2[0-9]{15}$)|(^3[47][0-9]{13}$)|(^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(12?[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$)");
    result = pattern.test(card_num);
    if(result==false){
        this.setCustomValidity("Invalid Card Number");
    }
    else{
        this.setCustomValidity("");
         cvv = document.getElementById("cvv");
         pattern = new RegExp("^3[47][0-9]{13}$");
         result = pattern.test(card_num);
         if(result == true){
                cvv.setAttribute("maxlength", "4");
                cvv.setAttribute("minlength", "4");
            }
          else{
            cvv.setAttribute("maxlength", "3");
            cvv.setAttribute("minlength", "3");
          }
    }
});

function change_png(){
  if (/^4/g.test(this.value)){
      document.getElementById("card-img").setAttribute("src", "img/visa.png");
          if (this.value.length == 19){
                document.getElementById("expiry_month").focus();
          }
      }
  else if (/(^5[1-5])|(^2[0-9])/g.test(this.value)) {
      document.getElementById("card-img").setAttribute("src", "img/mastercard.png");
      if (this.value.length == 19){
              document.getElementById("expiry_month").focus();
          }
  }
  else if (/(^3[47])/g.test(this.value)){
      document.getElementById("card-img").setAttribute("src", "img/amex.png");
      if (this.value.length == 18){
              document.getElementById("expiry_month").focus();
          }
  }
  else if(/^6/g.test(this.value)){
      document.getElementById("card-img").setAttribute("src", "img/discover.png");
      if (this.value.length == 19){
              document.getElementById("expiry_month").focus();
          }
  }
  else {
      document.getElementById("card-img").setAttribute("src", "img/all_other.png");
       if (this.value.length == 19){
              document.getElementById("expiry_month").focus();
          }
    }
  }


// Emptying the input values for modal_form
function form_reset(){
    document.getElementById("modal-form").reset();
}

// Calling form_reset on page load
form_reset();


function on_success_response(data){
    data.then(data1 => {
      window.location.href = 'https://sandbox.moderntransact.com/protecht/success.html?callbackurl='+callbackurl+"&order_number="+data1.order_number;
    });
}

function on_fail_response(data){

    data.then(data1 => {
    if (data1.error){
     let msg = data1.error.errors[0]["message"]
     if (msg.includes('duplicate') == true){
            throw ["Unable to continue record already exist."]
          }
      else{
            throw [data1.error.errors[0]["message"]];
      }
       }
     else{
       throw [JSON.stringify(data1)];
        }
    })
    .catch((err)=> {
        display_err(err);
    });
}


function display_err(err){
  let error_list = new Array;
  for(let x in err){
    error_list +=`<li>${err[x]}</li>`;
  }
    document.getElementById("display-error").innerHTML =
     `<div class="alert alert-danger alert-dismissible fade show">
      <ul>
           ${error_list}
      </ul>
     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
}
