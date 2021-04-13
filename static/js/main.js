document.getElementById('home_form').addEventListener("submit", function(e){
    e.preventDefault();
    document.getElementById("btn_modal").click();
});
document.getElementById("modal_form").addEventListener("submit", modal_field_validation);
document.getElementById("btn_close").addEventListener("click",add_impression);

// Function to get Authentication Token
function get_token(){
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
    .then((data) => {return data.token});
}

function add_impression() {
    quote_token = tg.get('token');
    console.log(get_token())
    get_token().then((data) => { fetch("https://api.ticketguardian-sandbox.com/impressions/",
        {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "JWT "+  data
            },
            body: JSON.stringify({"quote_token": quote_token})
        })
        .then(response => {return response.json()})
        .then(data1 => console.log(data1));
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
    // consolidating the required data
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
    get_token().then((data) => {fetch("https://connect-sandbox.ticketguardian.net/api/v2/orders/",
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

//Validation Method for Modal Inputs
function modal_field_validation(e){
    e.preventDefault();
    date = new Date();
    year = date.getFullYear();
    year = parseInt(year.toString().slice(2,));
    mnth = date.getMonth() + 1;
    exp_yr = document.getElementById("expiry_year")
    exp_mnth = document.getElementById("expiry_month");
    if (parseInt(exp_yr.value) == year){
        if ((parseInt(exp_mnth.value)== mnth) || (parseInt(exp_mnth.value) < mnth)){
            console.log("Year and month Error");
            setErrorFor(exp_yr, "Your card has been expired.");
        }
    }
    else if(parseInt(exp_yr.value) < year){
        setErrorFor(exp_yr, "Your card has been expired.");
    }
    else{
        retrieve_data();
        console.log("success");
    }
}

// If there is a Validation error it will change the color of input field and small tag to red
function setErrorFor(input, message) {
	const formControl = input.parentElement;
	const label = formControl.querySelector('label');
	label.className = 'form-label text-danger';
	const small = formControl.querySelector('small');
	input.className = 'form-control error';
	small.innerText = message;
	small.className = "text-danger";
}

// if there is no validation error then it will keep input as normal
function setSuccessFor(input) {
    const formControl = input.parentElement;
	const label = formControl.querySelector('label');
	label.className = 'form-label';
	const small = formControl.querySelector('small');
	input.className = 'form-control';
	small.innerText = "";
	small.className = "";
}
