from django.shortcuts import render
import requests
# Create your views here.


def index(request):
    return render(request, "details.html")


def display(request, order_num):
    response = requests.get(f"https://connect-sandbox.ticketguardian.net/api/v2/orders/{order_num}",
                            headers={"Authorization": f"JWT {get_token()}"})
    context = {"data": response.json}
    return render(request, "display.html", context)


def get_token():
    data = {"public_key": "pk_sandbox_c24dc55e4d07719b80c0916ce8a28e4dbf6a048f",
     "secret_key": "sk_sandbox_ea7865b84b0f4b762bd2d934ad1f750b84b5a3ba"}
    response = requests.post("https://connect-sandbox.ticketguardian.net/api/v2/auth/token/",data=data)
    return response.json().get("token")


def test(request):
    return render(request, "home.html")