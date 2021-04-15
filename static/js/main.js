document.getElementById('btn_proceed').addEventListener("click", field_validation);

document.getElementById("modal-form").addEventListener("submit", function(e){
    e.preventDefault();
    modal_field_validation();});

document.getElementById("btn_close").addEventListener("click", add_impression);

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

function retrieve_data() {
    // getting customer Data
    var customer_details = document.getElementById("customer").getElementsByClassName("form-control");
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
    //getting card Details
    let card_data = document.getElementById("card").getElementsByClassName("form-control");
    let card_details = extract_data(card_data);
    // Retrieving Email Address and storing it in customer_data instance
    customer_data["email"] = document.getElementById("email").value;
    // consolading the required data
    let all_data = {
        "quote": tg.get("token"),
        "customer": customer_data,
        "billing_address": billing_address,
        "ship_to_billing_addr": true,
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

function extract_data(data){
    let new_data = {};
    for (let i=0; i<data.length; i++){
       new_data[data[i].id] = data[i].value;
    }
    return new_data;
}

function field_validation(){
     const required_fields = ["order_number", "first_name", "last_name", "address1", "city", "state", "zip_code", "country","name", "reference_number", "cost"];
     const messages = ["Order Number", "First Name", "Last Name", "Address 1", "City", "State", "Zip Code", "Country", "Name", "Reference Number", "Cost"];
     let error = false;
    // Validating Field
    for(let x in required_fields){
            field = document.getElementById(required_fields[x]);
            if (field.value === ""){
                setErrorFor(field, messages[x] +" is required field");
                error = true;

            }
            else{
                setSuccessFor(field);
            }
    }

    if (error == false){
        document.getElementById("btn_modal").click();

    }

}
//
function modal_field_validation(){
     const required_fields = ["email", "number", "expiry_month",  "cvv"];
     const messages = ["Email", "Card Number", "Expiry Date", "CVV"];
     let error = false;
    // Validating Field
    for(let x in required_fields){
            field = document.getElementById(required_fields[x]);
            if (field.value === ""){
                setErrorFor(field, messages[x] +" is required field");
                error = true;
            }
            else{
                setSuccessFor(field);
            }
    }

    if (error == false){
        retrieve_data();
    }

}
//
function setErrorFor(input, message) {
	const formControl = input.parentElement;
	const label = formControl.querySelector('label');
	label.className = 'bmd-label-floating text-danger';
	const small = formControl.querySelector('small');
	input.className = 'form-control error';
	small.innerText = message;
	small.className = "text-danger";
}
//
function setSuccessFor(input) {
    const formControl = input.parentElement;
	const label = formControl.querySelector('label');
	label.className = 'bmd-label-floating';
	const small = formControl.querySelector('small');
	input.className = 'form-control';
	small.innerText = "";
	small.className = "";
}
//
//
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
                if(cvv.value != ""){
                     if(cvv.value.length!=4){
                        cvv.setCustomValidity("Invalid Cvv number");
                    }
                    else{
                        cvv.setCustomValidity("");
                    }
                }

            }
          else{
            cvv.setAttribute("maxlength", "3");
          }
    }
});

function change_png(){
  if (/^4/g.test(this.value)){
      document.getElementById("card-img").setAttribute("src", "/static/img/visa.png");
          }
  else if (/(^5[1-5])|(^2[0-9])/g.test(this.value)) {
      document.getElementById("card-img").setAttribute("src", "/static/img/mastercard.png");
  }
  else if (/(^3[47])/g.test(this.value)){
      document.getElementById("card-img").setAttribute("src", "/static/img/amex.png");
  }
  else if(/^6/g.test(this.value)){
      document.getElementById("card-img").setAttribute("src", "/static/img/discover.png");
  }
  else {
      document.getElementById("card-img").setAttribute("src", "/static/img/all_other.png");
    }
  }

function form_reset(){
    document.getElementById("modal-form").reset();
}
document.getElementById("btn_close").addEventListener("click", form_reset);
form_reset();

document.getElementById('btn-upper-close').addEventListener('click',form_reset);