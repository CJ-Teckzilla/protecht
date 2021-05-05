let searchParams = new URLSearchParams(window.location.search);
const callbackurl = searchParams.get("callbackurl");
const order_number = searchParams.get("order_number");

$(function(){
  $('#btn-success-close').bind('click', function(){
      top.window.location.href = callbackurl+"?order_number="+order_number;
  })
});
