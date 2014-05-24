<?php
/*
$sql = "CREATE TABLE ghostgame
(
PID INT NOT NULL AUTO_INCREMENT,
PRIMARY KEY(PID),
email CHAR(255),
score CHAR(255),
created TIMESTAMP,
sessionKey char(255)
)";

 */

$key = '123';  // "registration key"
$dataBaseName = 'ghostgame';
$dataBase = '';
$dataBaseHost = 'localhost';
$dataBaseUser = '';
$dataBasePassword = '';

$connection = mysql_connect($dataBaseHost,$dataBaseUser,$dataBasePassword)or die("connection fail");

mysql_select_db($dataBase)or die("Database fail");

function failMessage($failMessage) {

    echo json_encode($failMessage);
    exit;
}

function checkPostData($userEmail, $userScore, $key) {

    $failMessage = array(
                            'key' => '',
                            'userEmail' => '',
                            'score' => ''
    );

    if($_POST['key'] != $key) {
        $failMessage['key'] = "Der Key ist falsch";
    }

    if(!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        $failMessage['userEmail'] = "Die angegebene Email ist falsch";
    }

    if($userScore !== '' && !is_numeric($userScore)) {
        $failMessage['score'] = 'Score Fehler';
    }

    foreach($failMessage as $index => $value)
    {

        if($value[$index] != '') {

            failMessage($failMessage);
        }
    }

}

function insertData($userEmail, $userScore, $sessionKey, $dataBaseName) {

    $result = mysql_query("SELECT * FROM " . $dataBaseName . " WHERE email ='".$userEmail."' ");
    $resultAssoc = mysql_fetch_assoc($result);

    var_dump($resultAssoc['sessionKey']);

    if(mysql_num_rows($result) == 0 ) {

        $sql = "INSERT INTO " . $dataBaseName . " (email, score, sessionKey) VALUES ('". $userEmail. "',
                                                                       '". $userScore. "',
                                                                       '". $sessionKey. "'
                                                                       ) ";
        mysql_query($sql);

    }
    elseif(mysql_num_rows($result) != 0 && $resultAssoc['sessionKey'] == $sessionKey) {

        $sql = "UPDATE " . $dataBaseName . " SET score ='" . $userScore . "' WHERE email ='" . $userEmail . "' ";
        mysql_query($sql);

    }
    else {

        $failMessage = array( 'userEmail' => "Email Adresse ist schon vorhanden");

        failMessage($failMessage);
    }

}

if(isset($_POST['key']) && is_numeric($_POST['key']) ) {

    $userEmail = $_POST['email'];
    $userScore = $_POST['score'];
    $sessionKey = $_POST['sessionKey'];

    checkPostData($userEmail, $userScore, $key);
    insertData($userEmail, $userScore, $sessionKey, $dataBaseName);

}

if(isset($_POST['read']) && $_POST['read'] == 1) {
    $result = mysql_query("SELECT * FROM " . $dataBaseName . " ");
}
