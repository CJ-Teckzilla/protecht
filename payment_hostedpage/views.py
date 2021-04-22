from django.shortcuts import render, redirect, HttpResponse
import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializer import *
import json
from django.urls import reverse
# Create your views here.


# Main Page
def home(request):
    return render(request, "home.html")


# To Display the order details
def display(request, order_num):
    response = requests.get(f"https://connect-sandbox.ticketguardian.net/api/v2/orders/{order_num}",
                            headers={"Authorization": f"JWT {get_tokens()}"})
    context = {"data": response.json}
    return render(request, "display.html", context)


# Retrieve Token for accessing protecht API
def get_token(request):
    data = {"public_key": "pk_sandbox_c24dc55e4d07719b80c0916ce8a28e4dbf6a048f",
            "secret_key": "sk_sandbox_ea7865b84b0f4b762bd2d934ad1f750b84b5a3ba"}
    response = requests.post("https://connect-sandbox.ticketguardian.net/api/v2/auth/token/", data=data)
    if request.method == "GET":
        return HttpResponse(response.json().get("token"))


def get_tokens():
    data = {"public_key": "pk_sandbox_c24dc55e4d07719b80c0916ce8a28e4dbf6a048f",
            "secret_key": "sk_sandbox_ea7865b84b0f4b762bd2d934ad1f750b84b5a3ba"}
    response = requests.post("https://connect-sandbox.ticketguardian.net/api/v2/auth/token/", data=data)
    return response.json().get("token")


def success_response(request):
    return render(request, "success.html")
