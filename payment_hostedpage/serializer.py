from rest_framework import serializers
import re
from datetime import datetime


class Customer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(required=False)


class BillingAddress(serializers.Serializer):
    address1 = serializers.CharField()
    address2 = serializers.CharField(required=False, read_only=True)
    city = serializers.CharField()
    state = serializers.CharField(max_length=2)
    zip_code = serializers.CharField()
    country = serializers.CharField(max_length=3)


class ShippingAddress(serializers.Serializer):
    address1 = serializers.CharField()
    address2 = serializers.CharField(required=False)
    city = serializers.CharField()
    state = serializers.CharField(max_length=2)
    zip_code = serializers.CharField()
    country = serializers.CharField(max_length=3)


class Card(serializers.Serializer):
    number = serializers.CharField()
    expiry_month = serializers.CharField(max_length=2)
    expiry_year = serializers.CharField(max_length=2)
    cvv = serializers.CharField(max_length=4)

    def validate_expiry_month(self, value):
        if not re.fullmatch("(^[0][1-9]$)|(^[1][120]$)", value):
            raise serializers.ValidationError("Invalid Expiry Date.")
        return value

    def validate_expiry_year(self, value):
        if not value.isnumeric():
            raise serializers.ValidationError("Invalid Expiry Date.")
        return value

    def validate_number(self, value):
        if not re.fullmatch("(^4[0-9]{12}([0-9]{3})?$)|(^5[1-5][0-9]{14}$|^2[0-9]{15}$)|(^3[47][0-9]{13}$)|"
                            "(^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(12?[6-9]|1[3-9][0-9]|"
                            "[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$)", str(value)):
            raise serializers.ValidationError("Invalid Card Number")
        return value

    def validate(self, attrs):
        # Validation for expiry Date
        mnth = int(attrs.get("expiry_month"))  # getting expiry month and converting it to int type
        year = int(f"20{attrs.get('expiry_year')}")  # getting expiry year and converting it to int type
        day = int("30")  # Took date as 30
        date = datetime(year, mnth, day)  # Creating datetime object from user input
        if date < datetime.now():  # Comparing user input date with current date
            # if user input date is smaller then current date then it will raise below error
            raise serializers.ValidationError({"Expiry Date": ["Your card has been expired."]})
        # Validation for CVV. Amex accepts 4 digit cvv and rest 3 digit
        if re.fullmatch("^3[47][0-9]{13}$", str(attrs.get("number"))) and len(attrs.get("cvv")) != 4:
            raise serializers.ValidationError({"Expiry Date": "Invalid cvv number.Amex accepts 4 digit cvv number."})
        # if it is not an amex card then cvv should be of 3 digit
        elif not re.fullmatch("^3[47][0-9]{13}$", str(attrs.get("number"))) and len(attrs.get("cvv")) != 3:
            raise serializers.ValidationError({"Expiry Date": "Invalid cvv number.It should be of 3 digit."})
        return attrs  # if everything is fine it will return the data


class Items(serializers.Serializer):
    name = serializers.CharField()
    reference_number = serializers.CharField()
    cost = serializers.FloatField()


class Orders(serializers.Serializer):
    # Defining Attributes
    quote = serializers.CharField(required=False)
    customer = Customer()
    http_referrer = serializers.CharField(required=False, read_only=True)
    billing_address = BillingAddress()
    ship_to_billing_addr = serializers.BooleanField()
    shipping_address = ShippingAddress(required=False)
    order_number = serializers.CharField()
    currency = serializers.CharField(max_length=3)
    items = Items(many=True)
    card = Card()

    def validate(self, attrs):
        if attrs.get("ship_to_billing_addr") is False and attrs.get("shipping_address") is None:
            raise serializers.ValidationError({'shipping_address': 'This field is required.'})
        return attrs
