<? php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Collect and sanitize data
  $business = trim($_POST['Business_Name'] ?? '');
  $phone = trim($_POST['Phone'] ?? '');
  $email = trim($_POST['Email'] ?? '');
  $website = trim($_POST['Website'] ?? '');
  $subject = trim($_POST['Subject'] ?? 'New consulting request');
  $desc = trim($_POST['Description'] ?? '');
  $best_time = trim($_POST['Best_time_to_contact'] ?? '');
  $best_method = trim($_POST['Best_method_to_contact'] ?? '');
  $onsite = trim($_POST['On_site_presence_required'] ?? '');

  // Basic validation
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die('Invalid email address.');
  }

  $to = 'support@gcloudsolutions.org';
  $subjectLine = 'New Consulting Request: '.$business;

  $body = "Business Name: $business\n"
    . "Phone: $phone\n"
      . "Email: $email\n"
        . "Website: $website\n"
          . "Subject: $subject\n\n"
            . "Description:\n$desc\n\n"
              . "Best time to contact: $best_time\n"
                . "Best method to contact: $best_method\n"
                  . "On site presence required: $onsite\n";

  $headers = "From: noreply@gcloudsolutions.org\r\n"
    . "Reply-To: $email\r\n";

  if (mail($to, $subjectLine, $body, $headers)) {
        echo "Thanks! Your request has been sent.";
  } else {
        echo "Something went wrong sending your request. Please email support@gcloudsolutions.org directly.";
  }
} else {
    echo "Invalid request.";
}
