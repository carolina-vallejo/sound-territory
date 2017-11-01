
<?php 

$coords = '-0.361657,39.482551|-0.377181,39.479855';
if (isset($_GET['coordinates'])) {
	$coords = $_GET['coordinates'];
}

$theurl = 'https://api.openrouteservice.org/directions?';

$fields = array(
    'api_key' => '58d904a497c67e00015b45fc620cdd894ba446f44adc18e691dd36da',
    'coordinates' => $coords,
    'profile'=>'cycling-regular',
    'geometry' => 'true',
    'geometry_format' => 'geojson',
    'geometry_simplify' => 'true',
    'instructions' => 'false'   

);

$fields_string = rawurldecode(http_build_query($fields));


// Get cURL resource
$curl = curl_init();

// Set some options - we are passing in a useragent too here
curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $theurl . $fields_string
));
// Send the request & save response to $resp
$resp = curl_exec($curl);
// Close request to clear up some resources
curl_close($curl);

echo $resp;

?>
