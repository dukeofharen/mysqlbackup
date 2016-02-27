var argv = require('yargs').argv;
var exec = require('child_process').exec;
var path = require('path');
var dateFormat = require('dateformat');
var fs = require('fs');
var archiver = require('archiver');
var now = new Date();

var execute = function(argv){
    var location = argv.location;
    if(!location){
        return console.log("Please provide a backup location.");
    }
    var file_pattern = "mysql_backup"+dateFormat(now, "yyyymmddHHMM");
    var file_name = file_pattern+'.sql';
    var sql_path = path.join(location, file_name);
    var final_path = "";

    var db_user = argv.db_user;
    if(!db_user){
        return console.log("Please provide a MySQL username.");
    }

    var db_pass = argv.db_pass;
    if(!db_pass){
        return console.log("Please provide a MySQL password.");
    }

    var databases = argv.databases;

    var zip_backup = argv.zip_backup;

    var method = argv.method;

    var command = "mysqldump";
    if(databases){
        command += " --databases "+databases;
    }
    else{
        command += " --all-databases";
    }
    command += ' --user='+db_user+' --password='+db_pass+' > "'+sql_path+'"';

    exec(command, function(error, stdout, stderr) {
    if(error){
        console.log(stderr);
    }
    else{
        if(zip_backup){
            file_name = file_pattern+'.zip';
                var zip_location = path.join(location, file_name);
                final_path = zip_location;
                var output = fs.createWriteStream(zip_location);
                var archive = archiver('zip');

                output.on('close', function() {
                fs.unlink(sql_path, function(err){
                    if(err){
                        console.log(err);
                    }
                });
                run_method(zip_location, method, file_name, argv);
                });

                archive.on('error', function(err) {
                console.log(err);
                });

                archive.pipe(output);

                archive
                .append(fs.createReadStream(sql_path), { name: file_pattern+'.sql' })
                .finalize(zip_location);
        }
        else{
            run_method(sql_path, method, file_name, argv);
            final_path = sql_path;
        }
    }
    });
};

var run_method = function(final_file, method, file_name, argv){
    if(method){
        var method_path = path.join(__dirname, "./methods/"+method+".js");
        fs.stat(method_path, function(err) { 
            if (!err) { 
                var methodToExecute = require(method_path);
                methodToExecute.method(argv, final_file, file_name);
            }
            else{
                console.log("Backup method '"+method+"' not found.");
            }
        }); 
    }
    else{
        console.log("Backup saved to '"+final_file+"'.");
    }
}

if(argv.settings_file){
    fs.readFile(argv.settings_file, 'utf8', function (err,data) {
        if(err){
            console.log(err);
        }
        else{
            var settings = JSON.parse(data);
            execute(settings);
        }
    });
}
else{
    execute(argv);
}