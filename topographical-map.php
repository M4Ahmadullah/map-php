<?php
header('X-Frame-Options: ALLOWALL');

// Check if the request is coming from an iframe on localhost:3000 or your Vercel app
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$referer_https = str_replace('http:', 'https:', $referer); // Convert to HTTPS if needed
if (strpos($referer, 'https://sppmap.vercel.app') !== 0 && strpos($referer_https, 'https://sppmap.vercel.app') !== 0 && strpos($referer, 'https://localhost:3000') !== 0) {
    // Return a 404 error
    http_response_code(404);
    echo '404 Not Found';
    exit;
}

// Set CORS headers to allow both origins
header("Access-Control-Allow-Origin: https://sppmap.vercel.app, https://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// // Retrieve and sanitize latitude and longitude parameters from URL Will prevent XSS and other penetrations
$lat1 = filter_input(INPUT_GET, 'lat1', FILTER_SANITIZE_NUMBER_FLOAT);
$lng1 = filter_input(INPUT_GET, 'lng1', FILTER_SANITIZE_NUMBER_FLOAT);
$lat2 = filter_input(INPUT_GET, 'lat2', FILTER_SANITIZE_NUMBER_FLOAT);
$lng2 = filter_input(INPUT_GET, 'lng2', FILTER_SANITIZE_NUMBER_FLOAT);

// Generate the URL
$url = '/topographical-map.php?lat1=' . $lat1 . '&lng1=' . $lng1 . '&lat2=' . $lat2 . '&lng2=' . $lng2;

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="css/styles.css">
  <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon"> 
    <title>Street Plotter Prime Map</title>
  <script src="./js/jquery-3.3.1.min.js"></script>  
  <script src="./js/form-validation.js"></script>
  <script src="./js/header&zoom.js"></script>      
</head>


<body>
	  
	<div class="imapheader" id="iheader" onmouseover="headerOver();" onmouseout="headerOut();">
	<h3>
    <button type="button" id="stdbtn" class="btn btn-default fg-button fg-yellow" onclick="startD(event);">
	Start drawing
    </button>

    <button type="button" id ="undobtn" class="btn btn-default fg-button fg-blue" onclick="undoLine();">
	Undo
    </button>

    <button type="button" class="btn btn-default fg-button fg-red" onclick="clearLine();">
	Clear
    </button>

    <button type="button" class="btn btn-default fg-button fg-grey" onclick="goHome();">
	Home
    </button>
    </div>

    <div id="plan-map" class="oyh">
	
	</div>

	<script src="./js/mapApi.js"></script>
    <script src="./js/features.js">
        // Create latitude and longitude variables from PHP parameters
        var lat1 = <?php echo json_encode($lat1); ?>;
        var lng1 = <?php echo json_encode($lng1); ?>;
        var lat2 = <?php echo json_encode($lat2); ?>;
        var lng2 = <?php echo json_encode($lng2); ?>;

        // Load features.js passing the parameters as query parameters
        var script = document.createElement('script');
        script.src = 'js/features.js?lat1=' + lat1 + '&lng1=' + lng1 + '&lat2=' + lat2 + '&lng2=' + lng2;
        document.head.appendChild(script);
    </script>
	<script type="text/javascript" src="js/maplabel.js"></script>
    <script type="text/javascript"></script>
    <script src="./js/google-jquery-screensize.js"></script>
</body>
</html>
