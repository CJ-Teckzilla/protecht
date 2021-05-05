<?php
/*
"public_key": "pk_sandbox_c24dc55e4d07719b80c0916ce8a28e4dbf6a048f",
"secret_key": "sk_sandbox_ea7865b84b0f4b762bd2d934ad1f750b84b5a3ba"
url: https://connect-sandbox.ticketguardian.net/api/v2/auth/token/
token : kfopajfopsdfjkdsfjdfjpo
*/

$token='';

$headers = array("accept: application/json","content-type: application/json");
$obj=array(
'public_key'=>'pk_sandbox_c24dc55e4d07719b80c0916ce8a28e4dbf6a048f',
'secret_key'=>'sk_sandbox_ea7865b84b0f4b762bd2d934ad1f750b84b5a3ba'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_URL, 'https://connect-sandbox.ticketguardian.net/api/v2/auth/token/');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($obj));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$output = curl_exec($ch);
curl_close($ch);
if($output!==false)
{
	$rtn=json_decode($output, true);
	if(isset($rtn['token']) && trim($rtn['token'])!='')
	{
		$token=$rtn['token'];
	}
}
echo $token;
exit();

