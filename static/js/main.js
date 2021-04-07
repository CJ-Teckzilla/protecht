document.getElementById('submit_data').addEventListener("click", field_validation);

function retrieve_data() {
    console.log("retrieve DAta");
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
    //send_request(all_data);
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
     const required_fields = ["order_number", "first_name", "last_name", "email", "address1", "city", "state", "zip_code", "country","name", "reference_number", "cost", "number", "expiry_month", "expiry_year", "cvv"];
     const messages = ["Order Number", "First Name", "Last Name", "Email", "Address 1", "City", "State", "Zip Code", "Country", "Name", "Reference Number", "Cost", "Card Number", "Expiry Month", "Expiry Year", "CVV"];
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

function setErrorFor(input, message) {
	const formControl = input.parentElement;
	const label = formControl.querySelector('label');
	label.className = 'form-label text-danger';
	const small = formControl.querySelector('small');
	input.className = 'form-control error';
	small.innerText = message;
	small.className = "text-danger";
}

function setSuccessFor(input) {
    const formControl = input.parentElement;
	const label = formControl.querySelector('label');
	label.className = 'form-label';
	const small = formControl.querySelector('small');
	input.className = 'form-control';
	small.innerText = "";
	small.className = "";
}