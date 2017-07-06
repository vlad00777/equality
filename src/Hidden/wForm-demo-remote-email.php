<?php
	$value = $_GET['demo_remote_email'];
	$invalid = 'demo@site.com';
	if ($value == $invalid) {
		$result = $invalid.' уже занят';
	} else {
		$result = true;
	}
	echo json_encode($result);
?>