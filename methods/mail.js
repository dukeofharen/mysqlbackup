var nodemailer = require('nodemailer');
var fs = require("fs");

exports.method = function(argv, file_path, file_name){
    var smtp_host = argv.smtp_host;
    if(!smtp_host){
        return console.log("Please provide an SMTP host.");
    }
    
    var smtp_port = argv.smtp_port;
    if(!smtp_port){
        return console.log("Please provide an SMTP port.");
    }
    
    var smtp_secure = argv.smtp_secure;
    if(!smtp_secure){
        smtp_secure = false;
    }
    else{
        smtp_secure = smtp_secure == "1";
    }
    
    var smtp_user = argv.smtp_user;
    if(!smtp_user){
        return console.log("Please provide an SMTP username.");
    }
    
    var smtp_pass = argv.smtp_pass;
    if(!smtp_pass){
        return console.log("Please provide an SMTP password.");
    }
    
    var mail_from = argv.mail_from;
    if(!mail_from){
        mail_from = "info@mysqlback.up";
    }
    
    var mail_to = argv.mail_to;
    if(!mail_to){
        return console.log("Please provide a receiving e-mail address.");
    }
    
    var mail_subject = argv.mail_subject;
    if(!mail_subject){
        mail_subject = "MySQL backup";
    }
    
    var mail_text = argv.mail_text;
    if(!mail_subject){
        mail_text = "Here is your MySQL backup!";
    }
    
    var transporter = nodemailer.createTransport({
        host: smtp_host,
        port: smtp_port,
        secure: smtp_secure,
        auth: {
            user: smtp_user,
            pass: smtp_pass
        }
    });
  
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: mail_from,
        to: mail_to,
        subject: mail_subject,
        html: mail_text,
        attachments: [
            {   // stream as an attachment
                filename: file_name,
                content: fs.createReadStream(file_path)
            }
        ]
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
};