var express = require('express');
var http = require('http');
var jsforce = require('jsforce');
var fs = require('fs');

// Load configuration from the file
const sfdconfig = fs.readFileSync('./sfdcConfig.json');

// read json object
const config = JSON.parse(sfdconfig);

// create express based web server object
var app = express();

// Setting Port for the We Application
app.set('port', process.env.PORT || 3001 );


app.get('/', function (req, res) {
  var conn = new jsforce.Connection({
    // you can change loginUrl to connect to sandbox or prerelease env.
    //loginUrl : 'https://test.salesforce.com'
    loginUrl : 'https://login.salesforce.com'
  });

  //
  var username = config.sfdcConfig.username;
  var password = config.sfdcConfig.password;
  conn.login(username, password, function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token and instance URL information.
    // Save them to establish connection next time.
    console.log(conn.accessToken);
    console.log(conn.instanceUrl);
    // logged in user property
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    console.dir( userInfo);
    // ...
    res.send('JSForce Connect Successed!');

    // Perform a Select Query
    
  	conn.query("SELECT Name FROM Account", function(err, result) {
  		if (err) { return console.error("z"+err); }
  		// print the result
  		
  		console.dir(result.totalSize);
  		totalSize=result.totalSize;
  		console.log("fetched : " + result.records.length);
  		
  	
  		// Convert result to json object
  		var json = JSON.stringify(result);
  		console.dir(json);
  	});
	

	// Single record creation
	/*
	conn.sobject("Account").create({ Name : 'My Chris AC' }, function(err, ret) {
		if (err || !ret.success) { return console.error(err, ret); }
		console.log("Created record id : " + ret.id);
	});
	*/

	/*
	// multiple record creation
	conn.sobject("Account").create([
		{Name:'Chris1'},
		{Name:'Chris2'}
		],
		function(err,rets){
			if(err) {return console.error(err);}
			for (var i=0;i<rets.length;i++){
				if(rets[i].success){
					console.log("Created record :"+ rets[i].id);
				}
			}
		});
	*/

	/*
	//Bulk API to insert
	var accounts = [
	{Name:'Chris1'},
	{Name:'Chris2'},
	{Name:'Chris3'}
	];
	//Create job and batch
	var job = conn.bulk.createJob("Account","insert");
	var batch = job.createBatch();
	//start Job
	batch.execute(accounts);

	//listen for events
	// fired when batch request is queued in server.
	batch.on("error",function(batchInfo){
		console.log('Error,batchInfo ',batchInfo);
	});
	// start polling - Do not poll until the batch has started
	batch.on("queue",function(batchInfo){
		console.log('Queue,batchInfo ',batchInfo);
		batch.poll(1000 , 20000 );
	});

	// fired when batch finished and result retrieved
	batch.on("response", function(rets) {
		for (var i=0; i < rets.length; i++) {
			if (rets[i].success) {
				console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
			} else {
				console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
			}
		}
	});
	*/
	// Here ends the login block for SFDC
  });
  //res.send('Hello World');
  

});



http.createServer( app ).listen( app.get( 'port' ), function (){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});