// On Successful Submission of Merchant Form it will open Modal Pop up for Payment Form
document.getElementById('merchant_form').addEventListener("submit", function(e){
    e.preventDefault();
    field_validation();
});

// On Successful Submission of Modal Form
document.getElementById("modal-form").addEventListener("submit", function(e){
    e.preventDefault();
    retrieve_data();
    });

// On Closing the form call Add impression API
document.getElementById("btn_close").addEventListener("click", add_impression);

//Function to call Add impression API
function add_impression() {
    quote_token = tg.get('token');
    fetch("https://connect-sandbox.ticketguardian.net/api/v2/auth/token/",
    {
        method: "POST",
        headers:{
        'Content-type': 'application/json'
        },
        body: JSON.stringify({"public_key": "pk_sandbox_c24dc55e4d07719b80c0916ce8a28e4dbf6a048f",
                "secret_key": "sk_sandbox_ea7865b84b0f4b762bd2d934ad1f750b84b5a3ba"})
    })
    .then(response => {return response.json()})
    .then((data) => { fetch("https://api.ticketguardian-sandbox.com/impressions/",
        {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "JWT "+  data.token
            },
            body: JSON.stringify({"quote_token": quote_token})
        })
        .then(response => {return response.json()})
        .then(data1 => console.log(data1))
        }
    );
}

// Retrieving Data from Forms
function retrieve_data() {
    // getting customer Data
    let customer_details = document.getElementById("customer").getElementsByClassName("form-control");
    let customer_data = extract_data(customer_details);
    // getting billing address
    var billing_details = document.getElementById("billing").getElementsByClassName("form-control");
    let billing_address = extract_data(billing_details);

    //If customer has marked use billing address as Shipping address then populate the same data of billing
    if (document.getElementById("sameasbilling").checked == true){
         let shipping_address = billing_address;
         var shipping_address_status = true;
    }
    else{
        var shipping_details = document.getElementById("shipping").getElementsByClassName("form-control");
        let shipping_address = extract_data(shipping_details);
        var shipping_address_status = false;
    }
    let order_number = document.getElementById("order_number").value;
    let currency = document.getElementById("currency").value;
    // getting Item Details
    let item_data = document.getElementById("item").getElementsByClassName("form-control");
    let item_details = extract_data(item_data);
    // Manually Doing Changes
    customer_data["first_name"] = $('#cardholdername').val().substr(0, $('#cardholdername').val().indexOf(' '));
    customer_data["last_name"] = $('#cardholdername').val().substr($('#cardholdername').val().indexOf(' ')+1);
    customer_data["email"] = $('#email').val();
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
        "customer": customer_data,
        "billing_address": billing_address,
        "ship_to_billing_addr": shipping_address_status,
        "card": card_details,
        "order_number": order_number,
        "currency": "USD",
        "items": [item_details],
    };
    send_request(all_data);
}

function send_request(all_data){
   fetch("https://connect-sandbox.ticketguardian.net/api/v2/auth/token/",
    {
        method: "POST",
        headers:{
            'Content-type': 'application/json'
        },
        body: JSON.stringify({"public_key": "pk_sandbox_c24dc55e4d07719b80c0916ce8a28e4dbf6a048f",
                "secret_key": "sk_sandbox_ea7865b84b0f4b762bd2d934ad1f750b84b5a3ba"})
    })
    .then(response => {return response.json()})
    .then((data) => {fetch("https://connect-sandbox.ticketguardian.net/api/v2/orders/",
                    {
                        method: "POST",
                        headers: {'Content-type': 'application/json',
                                  'Accept': 'application/json',
                                  'Authorization': "JWT " + data.token,
                                  },
                        body: JSON.stringify(all_data)
                    })
                    .then(response => {
                             return response.json()})
                    .then(data1 => {
                        if(data1.error){
                            var errors_list = new Array();
                            for (var x in data1.error.errors){
                                errors_list.push(data1.error.errors[x].message);
                                }
                                document.getElementById("display-error").innerHTML =
                                 `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                                       ${errors_list}
                                 <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
                            }
                        else{
                               window.location.href = "success/"+data1.order_number
                        }
                        });
                    });
            }


// Extracting Data from forms
function extract_data(data){
    let new_data = {};
    for (let i=0; i<data.length; i++){
       new_data[data[i].name] = data[i].value;
    }
    return new_data;
}

// On Successful submission of Merchant Form This function will be called
function field_validation(){
        var fname = $('#first_name').val();
        var lname = $('#last_name').val();
        $('#cardholdername').val(fname+' '+ lname);
        $('#email').val($('#email_form').val());
        $('#address').val($('#address1').val());
        $('#postal_code').val($('#zip_code').val());
        document.getElementById("btn_modal").click();
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
      document.getElementById("card-img").setAttribute("src", "/static/img/visa.png");
          if (this.value.length == 19){
                document.getElementById("expiry_month").focus();
          }
      }
  else if (/(^5[1-5])|(^2[0-9])/g.test(this.value)) {
      document.getElementById("card-img").setAttribute("src", "/static/img/mastercard.png");
      if (this.value.length == 19){
              document.getElementById("expiry_month").focus();
          }
  }
  else if (/(^3[47])/g.test(this.value)){
      document.getElementById("card-img").setAttribute("src", "/static/img/amex.png");
      if (this.value.length == 18){
              document.getElementById("expiry_month").focus();
          }
  }
  else if(/^6/g.test(this.value)){
      document.getElementById("card-img").setAttribute("src", "/static/img/discover.png");
      if (this.value.length == 19){
              document.getElementById("expiry_month").focus();
          }
  }
  else {
      document.getElementById("card-img").setAttribute("src", "/static/img/all_other.png");
       if (this.value.length == 19){
              document.getElementById("expiry_month").focus();
          }
    }
  }


// Emptying the input values for modal_form
function form_reset(){
    document.getElementById("modal-form").reset();
}
// Calling form_reset() function to clear the values of input
document.getElementById("btn_close").addEventListener("click", form_reset);
// Calling form_reset on page load
form_reset();
